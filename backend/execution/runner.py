import sys
import json
import base64
import time
from typing import Dict, Any

def run_test_case(func, test_case: Dict[str, Any]) -> Dict[str, Any]:
    input_data = test_case['input']
    expected = test_case['expected_output']
    
    start_time = time.time()
    try:
        # Convert input string to arguments if needed, 
        # for now assuming single string/int input or adapting based on specific problem structure
        # simplistic eval for inputs like "1, 2" -> 1, 2
        # In a real system, we'd need a more robust input parser
        
        # Capture stdout
        from io import StringIO
        old_stdout = sys.stdout
        sys.stdout = mystdout = StringIO()
        
        # Execute
        # Assumption: The user code defines a 'Solution' class or 'solve' function
        # We need a standard contract. Let's assume a 'solve' function for now.
        result = func(input_data)
        
        sys.stdout = old_stdout
        output = str(result)
        
        duration = (time.time() - start_time) * 1000 # ms
        
        # Compare
        passed = str(output).strip() == str(expected).strip()
        
        return {
            'test_case_id': test_case.get('id'),
            'passed': passed,
            'output': output,
            'expected': expected,
            'execution_time': duration,
            'error': None
        }
    except Exception as e:
        return {
            'test_case_id': test_case.get('id'),
            'passed': False,
            'output': None,
            'expected': expected,
            'execution_time': (time.time() - start_time) * 1000,
            'error': str(e)
        }

if __name__ == '__main__':
    # Read payload from stdin or file
    # Format: { "code": "...", "test_cases": [...] }
    try:
        input_str = sys.stdin.read()
        data = json.loads(input_str)
        
        code = data['code']
        test_cases = data['test_cases']
        
        # Execute user code to define the function
        # We need to wrap it to avoid polluting namespace
        local_scope = {}
        exec(code, {}, local_scope)
        
        if 'solve' not in local_scope:
             print(json.dumps({"error": "Function 'solve' not found"}))
             sys.exit(1)
             
        solve_func = local_scope['solve']
        
        results = []
        for tc in test_cases:
            res = run_test_case(solve_func, tc)
            results.append(res)
            
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": f"System Error: {str(e)}"}))
        sys.exit(1)
