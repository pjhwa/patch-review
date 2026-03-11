# TODO: Fixing Pipeline Progress UI Lost on Navigation

## 목표
파이프라인 실행 중 다른 페이지로 이동했다가 대시보드로 다시 돌아와도 진행 상태(실행 중 표시, 로그 등)가 유지되도록 개선.

## 계획 (Step-by-Step)
- [ ] 1. **`api/pipeline` 엔드포인트 실제 구현**:
  - `src/app/api/pipeline/route.ts`가 현재 Mock 데이터를 반환 중인데, 이를 수정.
  - `@/lib/queue`에서 `pipelineQueue`를 가져와 `getActive()` 또는 `getWaiting()` 작업이 있는지 확인.
  - 진행 중인 job이 있다면 `jobId`와 상태를 반환하도록 API를 작성.
- [ ] 2. **`ProductGrid.tsx` 마운트 시 상태 복구 로직 추가**:
  - `useEffect`를 사용하여 컴포넌트 마운트 시 `/api/pipeline` 호출.
  - 진행 중인 job이 있다면 `jobId`를 사용하여 `EventSource`를 통해 `/api/pipeline/stream?jobId=...`에 다시 연결하고, `isRunning` 상태를 복구.
- [ ] 3. **진행 상태 유지 확인**:
  - 서버를 재시작하고, 파이프라인을 실행한 후 다른 탭으로 이동했다가 돌아왔을 때 스트리밍 로그와 상태가 정상적으로 이어지는지 검증.
- [ ] 4. **`LEARNED.md` 기록 및 GitHub 연동 (최종 확인)**.

## 우아함 검토 (Elegance & Readiness)
- 단순히 로컬 스토리지에 JobID를 저장하는 방식보다, 서버(BullMQ)에서 실제 Active Job을 조회하여 스트림에 연결하는 방식이 훨씬 안정적이고 근본적인 원인을 해결한다.
- `EventSource` 연결 로직을 재사용 가능한 함수로 빼서 모듈화 및 가독성을 높인다.
