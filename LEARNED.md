# Antigravity Learnings: Patch-Review

## 2026-02-25
- **상황 (Context)**: Windows 로컬 환경에서 Python 스크립트(`patch_preprocessing.py`)와 Node.js 스크립트(`batch_collector.js`)의 문법 검증 및 실행을 시도함.
- **문제 (Problem)**: 로컬 환경에 `python` 및 `node` 명령어가 PATH에 설정되어 있지 않아 `run_command` 실행이 실패함 (`ObjectNotFound`). 로컬 Windows에서의 의존성 부재.
- **실패 이유**: 로컬 환경 구성을 미리 파악하지 않고(Which 명령어 등) 바로 실행을 시도함.
- **교훈 (Lesson)**: 로컬 윈도우 환경에 실행 환경이 갖춰져 있지 않을 가능성을 고려하여, 주요 검증은 타겟 리눅스 서버(`tom26`, `citec@172.16.10.237`)로 스크립트를 배포(SCP)한 후 SSH를 통해 수행해야 함. 향후 동일한 문제가 발생하지 않도록, `verify_command` 시 로컬 환경 의존성을 선 확인하거나 바로 원격 서버를 활용할 것.
- **적용 (Action)**: SCP로 파일을 `tom26` 환경에 배포한 후 원격 서버 상에서 `py_compile`을 이용한 Python 문법 검증을 성공적으로 마침.
