# Patch-Review-Dashboard-v2 구조 분석, 문서화 및 Git 초기화 업데이트 계획

## 1. 계획 (Planning)
- [ ] 1.1. tom26 서버에 SSH로 접속(`citec@tom26` 또는 `citec@172.16.10.237`)하여 `~/patch-review-dashboard-v2`를 분석한다.
- [ ] 1.2. `~/.openclaw/workspace/skills/patch-review` 디렉토리에 있는 각 파이프라인 스크립트(RedHat, Oracle, Ubuntu, Ceph, MariaDB)를 상세 분석한다.
- [ ] 1.3. 시스템 설정(cron 등) 및 `openclaw agent:main` 호출 로직 등 AI 리뷰 작동 방식을 분석한다.

## 2. 문서화 (Execution)
- [ ] 2.1. 수집된 팩트 기반으로 `README.md` (영문) 작성 (Fancy 트렌드 적용).
- [ ] 2.2. 아키텍처, 파이프라인 플로우, 기술 스택, AI 구동방식에 대한 문서를 영문/한글 버전으로 각각 작성. (`docs/` 폴더 내 저장)
- [ ] 2.3. 모든 문서는 로컬의 `docs/` 및 Github 레포지토리에 동기화할 준비 완료.

## 3. 코드 재구성 및 GitHub 반영 (Execution)
- [ ] 3.1. 기존 GitHub의 리포지토리 내용 전부를 초기화(새로운 베이스로 덮어쓰기).
- [ ] 3.2. 현재 작동중인 대시보드 v2의 핵심 소스 코드를 로컬 리포지토리 디렉토리로 정리.
- [ ] 3.3. 서버의 파이프라인 디렉토리(`.openclaw/workspace/skills/patch-review/`)를 대시보드 프로젝트 내부에 복제(새로운 서버 적용을 위해 구조화).
- [ ] 3.4. 변경된 전체 코드와 문서를 git commit & push.

## 검토 (Review)
- [ ] 모든 문서가 추정이나 mock 데이터가 없는지 확인.
- [ ] 파이프라인 폴더 등 구조가 다른 사용자가 클론 시 정상 동작 가능하게 배치되었는지 확인.
