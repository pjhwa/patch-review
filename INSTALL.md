# 🛠️ OpenClaw Patch-Review 환경 구축 및 설치 가이드 (Setup Guide)

본 문서는 사전에 전혀 세팅되어 있지 않은 **완전한 신규 OpenClaw Linux 환경**에 `Patch-Review` 에이전트 워크스페이스 생태계를 처음부터 끝까지 구성하고, `patch-review-dashboard` 대시보드를 연동 구동하는 방법에 대한 **통합 설치 가이드(A to Z)**입니다.

---

## 📌 1. 사전 요구 사항 (Prerequisites)

- **Target OS**: Ubuntu 22.04 LTS 혹은 24.04 LTS
- **Node.js**: v20 이상 권장 (nvm 환경 권장)
- **Python**: v3.10 이상 + `pip` 설치 필수
- **OpenClaw CLI**: 설치 및 환경 세팅 완료 상태
- **네트워크**: `포트 3000` 방화벽 개방 (Next.js 웹 대시보드 호스팅 용도)

---

## 🛠️ 2. 리눅스 Agent Skill 디렉토리 세팅

대시보드 백엔드는 파일 시스템(fs)을 직접 파싱하기 때문에, 정해진 절대경로 룰을 따라야 합니다. 오픈클로(OpenClaw) 권장 스킬 모듈 경로에 환경을 구축합니다.

### 2.1. 작업 폴더(Workspace) 생성
```bash
# 기본 오픈클로 워크스페이스/스킬 디렉토리 생성
mkdir -p ~/.openclaw/workspace/skills/patch-review/os/linux
cd ~/.openclaw/workspace/skills/patch-review/os/linux
```

### 2.2. 백엔드 처리 코어 스크립트 복사 및 주입
에이전트 단에서 웹 크롤링 및 데이터 전처리를 담당할 JS 및 Python 스크립트들을 위 폴더(`os/linux`) 안에 복사(혹은 `git clone`)합니다.

1. **`batch_collector.js`**: 벤더사(Red Hat, Oracle, Ubuntu) 패치 데이터를 스크래핑하는 Data Ingestion 로직
2. **`patch_preprocessing.py`**: 데이터 중 노이즈를 필터링하고 시스템 아키텍처에 위협이 되는 핵심 패치만 남기는 Pruning 로직
3. **`test_execute.sh`** (옵션): 단일 쉘에서 Node.js와 Python을 묶어서 실행해주는 통합 테스트 래퍼 쉘.

### 2.3. Python & Node.js 의존성 패키지 설치
Data Scraping 모듈이 요구하는 라이브러리들을 설치합니다.
```bash
# Node.js 패키지 초기화 및 설치 (axios, cheerio 지원 가정)
npm install axios cheerio fs path util

# 파이썬 보안 점검 스크립트 패키지 설치
pip3 install pandas
```

---

## 🌐 3. Next.js App Router 대시보드 (patch-review-dashboard) 구성

이제 위에서 구축한 백엔드 엔진을 모니터링 및 시각화해 줄 프론트엔드 대시보드를 세팅합니다.

### 3.1. 대시보드 리포지토리 준비
원하는 경로(예: `/home/citec/patch-review-dashboard`)에 대시보드 소스를 놓습니다.
```bash
cd ~/.openclaw/workspace
# 만약 Git을 통한 복사라면 git clone 사용
# 일반 복사라면 해당 폴더로 진입
cd patch-review-dashboard
```

### 3.2. 프론트엔드 의존성 설치
Tailwind CSS, Lucide Icons, Shadcn-UI 등 모던 디자인 스택이 포함되어 있습니다.
```bash
# 프로젝트 종속성 설치
npm install
# 혹시나 package-lock 충돌이 난다면 아래 명령어 사용
npm install --legacy-peer-deps
```

### 3.3. API 경로 환경 변수 확인 (중요)
`src/app/api/products/route.ts` 및 `execute/route.ts` 내부를 보시면, Python과 JS 엔진 파일들을 읽어들이는 코어 상수 주소가 하드코딩 되어있을 수 있습니다.

```typescript
// 예시: 소스코드 상의 경로를 내 리눅스 절대경로에 맞춰 검토 필요
const linuxSkillDir = path.join(process.env.HOME || '/home/citec', '.openclaw/workspace/skills/patch-review/os/linux');
```
만약 환경 구성 유저명이 `citec`이 아니라면 (`ubuntu` 등), 위 경로 매핑이 올바른지 소스코드 내역을 한번 체크합니다.

---

## 🚀 4. 구동 및 프로세스 데몬 관리 (PM2 권장)

기본적으로 Next.js는 `npm run dev` 스크립트로 개발 모드로 실행할 수 있지만, 리눅스 서버에서 영구적으로 (실서비스용으로) 오픈하려면 무중단 빌드가 필요합니다.

### 4.1. 정적 빌드 수행 (Production Build)
```bash
cd ~/.openclaw/workspace/patch-review-dashboard
# Next.js 15 엔진을 가동하여 프로덕션 아티팩트 빌드
npm run build
```

### 4.2. 실행 (Start)
```bash
# 포트 3000번으로 서비스 온에어
npm run start
```
웹 브라우저를 통해 `http://[해당리눅스IP]:3000` 에 접근하여 파란색 UI가 나타난다면 설치 대성공입니다.

---

## 🛡️ 5. 트러블슈팅 (Troubleshooting & Tips)

- **Q: 대시보드에서 파이프라인 실행 버튼을 눌렀는데 'Failed'가 발생해요.**
  - **A**: 제일 먼저 리눅스 백엔드 폴더(`os/linux`)에 가시면 백그라운드 런타임 로그를 담고 있는 `debug_collector.log` 파일이 생성되어 있습니다. `cat` 명령어로 에러 스택트레이스를 열람하십시오. Node.js 혹은 OpenClaw 경로를 찾지 못하는 환경변수 에러일 가능성이 큽니다 (`route.ts` 경로 하드코딩 점검).

- **Q: 제품별 (Red Hat 등) 패치 데이터가 아예 표출이 안됩니다.**
  - **A**: `patch_review_final_report.csv` 파일이나 `batch_data/*.json` 파일이 아직 한 번도 생성된 적 없는 최초 셋업 직후의 빈 깡통 상태이기 때문입니다. 대시보드 상에서 **[Run Pipeline]** 버튼을 한번 눌러 데이터 엔진 수집 루프를 발동시켜 주십시오.

- **Q: 외부 환경에서 `http://IP:3000` 브라우저 접근이 거부됩니다.**
  - **A**: 우분투 `ufw` 혹은 클라우드 인스턴스 VNC 보안 그룹 (Security Group) 방화벽 설정에서 3000번 포트 인바운드를 허용해 주셔야 합니다. (`sudo ufw allow 3000/tcp`)
