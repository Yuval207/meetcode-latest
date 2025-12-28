from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.submission import Submission
from app.models.question import Question, TestCase
from app.models.user import User
from app.schemas.submission import SubmissionRun, SubmissionCreate, SubmissionResponse, SubmissionResult
from app.db.session import get_db
from app.services.execution_service import ExecutionService

router = APIRouter()
execution_service = ExecutionService()

@router.post("/run", response_model=SubmissionResult)
async def run_code(
    *,
    db: AsyncSession = Depends(get_db),
    submission_in: SubmissionRun,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Run code against SAMPLE test cases only. Does not save submission to DB.
    """
    # Fetch question and sample test cases
    query = select(Question).where(Question.id == submission_in.question_id).options(
        selectinload(Question.test_cases)
    )
    result = await db.execute(query)
    question = result.scalars().first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Filter for sample test cases
    # If no explicitly marked samples, take first 2
    sample_tests = [tc for tc in question.test_cases if tc.is_sample]
    if not sample_tests:
        sample_tests = question.test_cases[:2]
        
    if not sample_tests:
        raise HTTPException(status_code=400, detail="No test cases available for this question")

    # Format test cases for execution
    test_cases_payload = [
        {
            "id": str(tc.id),
            "input": tc.input,
            "expected_output": tc.expected_output
        }
        for tc in sample_tests
    ]
    
    # Execute
    results = await execution_service.execute_code(
        code=submission_in.code,
        language=submission_in.language,
        test_cases=test_cases_payload
    )
    
    # Analyze results
    total = len(results)
    passed = sum(1 for r in results if r.get('passed', False))
    error = next((r.get('error') for r in results if r.get('error')), None)
    
    status_str = "accepted" if passed == total else "wrong_answer"
    if error:
        status_str = "runtime_error" # Simplification
        
    return {
        "status": status_str,
        "test_cases_passed": passed,
        "total_test_cases": total,
        "error_message": error,
        "details": results
    }

@router.post("/submit", response_model=SubmissionResponse)
async def submit_code(
    *,
    db: AsyncSession = Depends(get_db),
    submission_in: SubmissionCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Submit code against ALL test cases. Saves submission.
    """
    # Fetch question and ALL test cases
    query = select(Question).where(Question.id == submission_in.question_id).options(
        selectinload(Question.test_cases)
    )
    result = await db.execute(query)
    question = result.scalars().first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Format test cases
    test_cases_payload = [
        {
            "id": str(tc.id),
            "input": tc.input,
            "expected_output": tc.expected_output
        }
        for tc in question.test_cases
    ]
    
    # Execute
    results = await execution_service.execute_code(
        code=submission_in.code,
        language=submission_in.language,
        test_cases=test_cases_payload
    )
    
    # Analyze results
    total = len(results)
    passed = sum(1 for r in results if r.get('passed', False))
    error = next((r.get('error') for r in results if r.get('error')), None)
    
    avg_time = 0
    times = [r.get('execution_time', 0) for r in results if isinstance(r.get('execution_time'), (int, float))]
    if times:
        avg_time = int(sum(times) / len(times))
        
    status_str = "accepted" if passed == total else "wrong_answer"
    if error:
        status_str = "runtime_error" 
        
    # Save submission
    submission = Submission(
        user_id=current_user.id,
        question_id=question.id,
        code=submission_in.code,
        language=submission_in.language,
        submission_type="submit",
        status=status_str,
        test_cases_passed=passed,
        total_test_cases=total,
        execution_time=avg_time,
        error_message=error,
        match_participant_id=None # For now
    )
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    # Return response
    resp = SubmissionResponse.from_orm(submission)
    resp.details = results
    
    # Notify Match via WebSocket that a submission occurred
    # We need to find the match ID. Currently schema has match_id but we just created it?
    # Actually, submission_in.match_id IS optional. If it exists, we link it.
    
    if submission_in.match_id:
        # Check if match participant records exist and update them? 
        # For MVP, just broadcast "opponent_submitted"
        
        # We need WebSocket Manager here. It's not imported.
        # Let's import inside function to avoid circular imports if any, or at top.
        from app.services.websocket_manager import manager
        
        # Broadcast to match
        await manager.broadcast_match_event(
            match_id=str(submission_in.match_id),
            event_type="match:opponent_submitted",
            data={
                "userId": str(current_user.id),
                "status": status_str,
                "passed": passed,
                "total": total
            }
        )
        
        # If accepted (ALL passed), broadcast WINNER!
        if status_str == "accepted":
            await manager.broadcast_match_event(
                match_id=str(submission_in.match_id),
                event_type="match:completed",
                data={
                    "winnerId": str(current_user.id),
                    "result": "win"
                }
            )
            
            # TODO: Update Match status in DB to 'completed' and set winner_id
            # This logic should be moved to a service to keep API clean
            
    return resp
