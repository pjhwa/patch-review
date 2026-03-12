# 대시보드 V2 신규 카테고리 & 제품 추가 가이드 (Adding a New Product Pipeline)

이 문서는 Patch Review Dashboard V2에 새로운 벤더 제품(예: Storage 카테고리의 Ceph)을 추가하고 AI 리뷰 파이프라인을 엔드투엔드(End-to-End)로 연동할 때 **반드시 거쳐야 하는 필수 단계와 체크리스트**를 정의한 강력한 지침서입니다.

새로운 제품을 추가할 때는 프론트엔드 UI만 수정해서는 안 되며, 파이썬 전처리 모듈부터 Next.js 백엔드 API, BullMQ 워커까지 풀스택(Full-stack) 확장이 동시에 완벽하게 맞물려야 합니다.

---

## 단계별 필수 작업 체크리스트

### 1. Python 전처리 스크립트 구축 (`*_preprocessing.py`)
데이터 수집기(Collector)가 가져온 원본 JSON/XML 파일을 읽어서 AI 리뷰에 적합한 포맷으로 변환하고, 데이터베이스에 등록하는 핵심 단계입니다.

- [ ] **디렉토리 분리 및 스크립트 작성**: `~/.openclaw/workspace/skills/patch-review/[카테고리]/[제품명]/` 하위에 `[제품명]_preprocessing.py` 생성.
- [ ] **DB 매핑 (중요)**: 스크립트 내에서 `Prisma` 로컬 데이터베이스(`patch-review.db`)의 `PreprocessedPatch` 테이블 구조에 정확히 맞춰서 `INSERT OR REPLACE` 쿼리 작성. (특히 날짜는 `.strftime("%Y-%m-%d %H:%M:%S")` 로 ISO의 `T` 포맷을 필히 제거해야 Prisma 호환 오류가 안 남).
- [ ] **Audit Log 기록 의무화**: 조건에 미달하여 버려지는(Drop) 패치들은 수동 UI 확인에 의존하지 말고, 스크립트 단계에서 즉시 `dropped_patches_audit_[prod].csv` 파일로 내보내어 전처리 투명성을 100% 확보할 것.
- [ ] **결정론(Determinism) 적용**: 파일 목록(`glob`)이나 배열(set) 등을 평가할 때는 반드시 `sorted()`를 감싸주어 해시 무작위화에 의한 UI 개수 변동 버그를 원천 차단.

### 2. 백그라운드 워커 큐 추가 (`src/lib/queue.ts`)
대시보드에서 "Run Pipeline" 버튼을 눌렀을 때 실행될 BullMQ 작업(Job)을 프론트-백엔드 간에 중계하는 곳입니다.

- [ ] **Job 분기 추가**: `job.name === 'run-[제품명]-pipeline'` 형태로 분기(if-else) 추가.
- [ ] **DB 초기화 로직 추가**: 파이프라인 재실행(Retry) 시 중복을 막기 위해 실행 맨 처음에 `deleteMany({ where: { vendor: '[벤더명]' } })`로 낡은 데이터를 반드시 비우기.
- [ ] **전역 Mutex 락 적용 (`withOpenClawLock`)**: AI 에이전트(`openclaw`) 호출 부분은 반드시 `withOpenClawLock`으로 감싸서 다중 실행 시 컨텍스트(.jsonl) 오염을 막고 100% 고립된 세션에서 수행되도록 보장할 것.
- [ ] **상태 로그 출력**: `job.log()`와 `job.updateProgress()`를 적절히 배치해 대시보드 UI에 진행 상황이 실시간 동기화 되도록 할 것.

### 3. 통계 및 라우터 API 확장 (`src/app/api/...`)
카테고리별 제품 개수를 세고 진행 상태를 반환하는 Next.js 엔드포인트입니다.

- [ ] **products 요약 라우터 (`api/products/route.ts`)**: `req.nextUrl.searchParams.get('category')`를 받아, 신규 카테고리 요청인 경우 해당 카테고리의 폴더(예: `ceph_data`) 파일 수를 세어 `collected` 진행 카운트에 합산하여 반환.
- [ ] **파이프라인 실행 라우터 (`api/pipeline/[제품명]/run/route.ts`)**: UI에서 파이프라인 스위치를 눌렀을 때 BullMQ에 신규 Job(`run-[제품명]-pipeline`)을 Push하는 API 작성.
- [ ] **완료(Finalize) 라우터 (`api/pipeline/[제품명]/finalize/route.ts`)**: 리뷰 담당자가 "승인(DONE)" 버튼을 눌렀을 때 결과 JSON을 확정판 CSV(`final_approved_patches_[prod].csv`)로 내보내는 엔드포인트 작성.

### 4. 대시보드 UI 연동 및 컴포넌트 활성화 (`page.tsx`, `ProductGrid.tsx`, `ClientPage.tsx`)
진척도를 화면에 노출하고 버튼의 동작 스위치를 켭니다.

- [ ] **카테고리 활성화 (`CATEGORIES`)**: `src/app/page.tsx` 내부의 `CATEGORIES` 배열에서 추가한 카테고리의 `active: false`를 **반드시 `active: true`** 로 변경. (누락 시 빈 화면이나 비활성 그레이스케일 UI로 렌더링 됨)
- [ ] **완료 개수 수식 추가**: `page.tsx` 등에서 `[카테고리]ReviewCountSum` 을 `[컴플리트된 제품 수]/[전체 제품 수]` 형식(`완료/전체`)으로 하드 코딩 렌더링 되지 않도록 동적 수식 연산 추가.
- [ ] **제품 페이지 일반화 (`category/[categoryId]/page.tsx`)**: 카테고리 페이지 진입 시, 하드 코딩된 카테고리(예: `isLinux`) 검사 대신 `isActive` 프로퍼티를 활용하여 일반적인 활성 점검 로직으로 리팩토링할 것.
- [ ] **컴포넌트 API 분기 (`ProductGrid.tsx`, `ClientPage.tsx`)**: `categoryId` 상태값에 따라 "파이프라인 실행", "상태 조회", "DONE(승인)" 버튼 클릭 시 일반 API가 아닌, 3단계에서 만든 **제품 전용 API 라우터**(`.../[제품명]/run`, `.../[제품명]/finalize` 등)로 분기되어 요청이 가도록 Fetch URL을 조건부 수정.

---

## 🚫 과거 주요 잦은 실수 리마인드 (Don'ts)
- 전처리 로직만 파이썬에 짠 후 UI의 `active: true`를 까먹어서 카드가 어둡게 표시됨. **항상 풀스택 스위치를 다 켰는지 확인하세요.**
- 다른 제품의 파이프라인 코드를 복붙하다가 API 라우터 주소나 Prisma DB Vendor 이름(`where: { vendor: 'Ceph' }`)을 안 바꿔서 엉뚱한 제품 목록에 데이터가 튀어나오고 오염됨.
- Python 코드 변경 후 해당 코드를 불러오는 `queue.ts`의 `spawn` 인수(args)는 그대로 둬서 인자(argument) 불일치로 파이프라인이 즉각 비정상 종료됨.
- 신규 페이지를 붙이고 로컬에서만 빌드 에러가 안 나는 걸 본 뒤, 서버(`scp`)로 파일 마이그레이션을 누락하여 정작 운영 대시보드 렌더링은 바뀌지 않음. (배포 규율 엄수 요망)
