import asyncio
import logging
import sys
import os

# Ensure app can be imported
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.db.session import engine, AsyncSessionLocal
from app.models.question import Question, TestCase
from app.models.match import Match, MatchParticipant
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_questions():
    async with AsyncSessionLocal() as db:
        # Check if questions exist
        result = await db.execute(select(Question))
        if result.scalars().first():
            logger.info("Questions already exist.")
            return

        logger.info("Seeding questions...")
        
        q1 = Question(
            title="Two Sum",
            slug="two-sum",
            description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            difficulty="easy",
            avg_solve_time=600
        )
        q1.test_cases = [
            TestCase(input="nums = [2,7,11,15], target = 9", expected_output="[0,1]", is_hidden=False),
            TestCase(input="nums = [3,2,4], target = 6", expected_output="[1,2]", is_hidden=True)
        ]

        q2 = Question(
            title="Reverse String",
            slug="reverse-string",
            description="Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
            difficulty="easy",
            avg_solve_time=300
        )
        q2.test_cases = [
             TestCase(input='s = ["h","e","l","l","o"]', expected_output='["o","l","l","e","h"]', is_hidden=False)
        ]

        q3 = Question(
            title="Add Two Numbers",
            slug="add-two-numbers",
            description="You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
            difficulty="medium",
            avg_solve_time=900
        )
        q3.test_cases = [
             TestCase(input="l1 = [2,4,3], l2 = [5,6,4]", expected_output="[7,0,8]", is_hidden=False)
        ]

        q4 = Question(
            title="Longest Substring Without Repeating Characters",
            slug="longest-substring",
            description="Given a string s, find the length of the longest substring without repeating characters.",
            difficulty="medium",
            avg_solve_time=1200
        )
        q4.test_cases = [
             TestCase(input='s = "abcabcbb"', expected_output="3", is_hidden=False),
             TestCase(input='s = "bbbbb"', expected_output="1", is_hidden=False)
        ]

        q5 = Question(
            title="Median of Two Sorted Arrays",
            slug="median-of-two-sorted-arrays",
            description="Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
            difficulty="hard",
            avg_solve_time=1800
        )
        q5.test_cases = [
            TestCase(input="nums1 = [1,3], nums2 = [2]", expected_output="2.00000", is_hidden=False)
        ]

        db.add_all([q1, q2, q3, q4, q5])
        await db.commit()
        logger.info("Questions seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed_questions())
