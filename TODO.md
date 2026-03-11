# Patch Review Board - Dashboard TODO

## 작성일: 2026-02-27

Mission Control Dashboard에서 영감을 받은 **Patch Review Board** 통합 대시보드 구축을 위한 단계별 구현 계획입니다.

---

## 2026-02-27 검토 완료 작업내역
- [x] Dashboard 메인 카드 숫자를 더미 데이터에서 실서버 기준 실제 진행률 (ex: 3 / 7 Products Reviewed | 21 Patches Reviewed)로 변경 적용 
- [x] 리뷰 완료된 카테고리의 하위 제품 클릭 시, 각 제품 상세 리뷰 화면에서 담당자가 패치의 적합성(제외 여부)을 평가하도록 UI 개선.
- [x] 담당자가 리뷰 완료 후 **[Mark Product Review as DONE]** 버튼 클릭 시 `api/pipeline/finalize` 백엔드 로직을 통해 최종 `final_approved_patches_[prod].csv` 파일이 톰캣 서버에 안전하게 생성/저장.
- [x] 카테고리 상세 페이지 우측 상단에 **[Download Final CSV Document]** 추가.
- [x] **BugFix**: Finalize 로직에서 빈 CSV(헤더만 존재)가 생성되던 이슈 해결. (기존 JSON 대신 최종 AI 결과물인 `patch_review_final_report.csv` 원본을 직접 파싱하게 PapaParse 플러그인 도입 및 로직 교체)
- [x] **New Feature**: 전역 레이아웃 및 각 기능별 UI 컴포넌트에 대한 완전한 다국어(KOR/ENG) i18n 지원 구현 및 쿠키 기반의 상태 저장 연동 완료.

## 신규 기능 완료내역 (2026-03-11)
- [x] **New Feature**: `patch_preprocessing.py` 전처리 스크립트 실행 시, 필터링 로직에 의해 누락된 패치들의 정확한 사유를 기록하는 Audit Log (`dropped_patches_audit.csv`) 자동 생성 기능 추가 (신뢰도 검증용 목적).

## 1. 계획 및 분석 단계 (Planning & Analysis)
- [x] 요구사항 분석: 각 카테고리/제품별 패치 계층 구조 파악
- [x] 분기별 스케줄링 및 파이프라인(수집 -> 전처리 -> AI 분석 -> 담당자 검토) 파이프라인 구조화
- [x] Mission Control 기반 프리미엄 UI/UX 기조 적용 방안 설계
- [x] 사용자/팀에게 초기 구현 계획(Implementation Plan) 검토 받기 (현재 단계)

## 2. 기반 환경 설정 (Environment Setup)
- [x] 프론트엔드 스택 초기화: Next.js 15 (App Router), Tailwind CSS v4, Framer Motion, Shadcn UI
- [x] 백엔드/데이터 상태: 파일 기반 파이프라인(JSON) 연동 구성
- [x] 기본 UI/UX 컴포넌트: Dark Mode 전용 프리미엄 테마 적용 (glassmorphism 등)

## 3. 데이터 모델링 및 시각화 (Data Modeling & Visualization)
- [x] 분류 체계 (Taxonomy) 데이터 모델 작성: `Category(os, middleware...) > Product(linux, windows...) > Sub-Product(Red Hat...)`
- [x] 파이프라인 스테이지별 데이터 스키마 정의 (json 파일 포맷 기준)` -> `수집 완료` -> `전처리 완료` -> `AI 분석 완료(담당자 확인)`
- [x] 대시보드 Overview 화면 개발: 각 제품별 단계별 현황과 패치 개수 실시간 표시

## 4. 백엔드 로직 및 자동화/수동 실행 (Backend & Automation)
- [x] 수동 실행 트리거: 각 카테고리 뷰어의 `Run Pipeline` 클릭 시 -> Next.js API Routes (`/api/pipeline/execute`) 호출
- [x] 파이프라인 1단계 (수집): `batch_collector.js` 실행 -> `batch_data/` 디렉토리에 원시 데이터 JSON 생성
- [x] 파이프라인 2단계 (전처리): `patch_preprocessing.py` 실행 -> `patches_for_llm_review.json` 생성
- [x] 파이프라인 3단계 (AI 리뷰): OpenClaw Agent 호출 (`SKILL.md` Step 3 연동) -> `patch_review_final_report.csv` 생성
- [x] 프론트엔드 실시간 카운트 UI: 수집된 패치, 전처리된 패치, AI 리뷰 완료된 패치 개수를 각 스테이지별로 화면에 표시
- [x] 수동 트리거 UI 개발: 대시보드 UI에 모든 카테고리를 표시하되, 실제 실행 로직은 `os -> linux` 계열만 작동하도록 구성.

## 5. 담당자 검토 뷰 및 패치 상세 (Review Board & Details)
- [x] AI 리뷰 결과 테이블 뷰 개발: 담당자가 확인해야 할 최종 패치 목록
- [x] 세부 패치 모달/페이지 개발: AI가 작성한 치명적인 버그 수정 내역 설명 확인 기능
- [x] CSV 출력 기능: 최종 검토 대상 패치 목록을 CSV 파일로 다운로드하는 기능 개발
- [x] 과거 기록(Archive) 화면 개발: 파이프라인 재실행 시 백업된 이전 히스토리 내역 조회 및 CSV 다운로드 연동 완료

## 6. 테스트 및 검증 (Testing & Validation)
- [x] 스태프 엔지니어 수준의 코드 리뷰 및 구조적 우아함 검토
- [x] 전체 파이프라인 수동/자동 전환 통합 테스트
- [x] UI 랜더링 품질 (모바일 반응형, 애니메이션) 시각적 검증

## 7. 완료 및 문서화 (Documentation)
- [x] `LEARNED.md` 업데이트 (이슈 및 트러블슈팅 내역)
- [x] 최신 트렌드의 Fancy한 GitHub README 문서 작성

---

## (이전 작업 내용 - 보관)
- [x] Oracle Linux 패치 리뷰 로직 스크립트 수정 및 검증 완 (2026-02-25 이전)
