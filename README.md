# BlockPass Ω (Omega)

**차세대 블록체인 기반 로그인 인프라**

> "보이지 않는 블록체인이 당신의 로그인 뒤에서 작동한다."

## 개요

BlockPass Ω는 기존의 ID + Password 로그인 방식을 유지하면서, 그 내부 인증 구조 전체를 블록체인 네트워크 기반으로 재설계한 차세대 하이브리드 인증 인프라입니다.

사용자는 평범하게 로그인하지만, 실제로는 다중 블록체인 합의와 스마트컨트랙트 검증이 그 뒤에서 동시에 작동합니다.

## 주요 특징

- ✅ **블록체인 해시체인**: 비밀번호를 블록체인에서 검증
- ✅ **스마트컨트랙트 세션**: 세션 자체를 블록체인 자산으로 관리
- ✅ **분산 로그 저장**: IPFS + Arweave 영구 기록
- ✅ **DID 자동 생성**: 사용자별 고유 분산 ID
- ✅ **이중 합의 검증**: Private + Public Chain 병행
- ✅ **간편한 통합**: SDK만 추가하면 블록체인 로그인 완성

## 아키텍처

```
사용자 → SDK → API Gateway → Blockchain Network
                    ↓
           [BDID Chain]
           [Fabric Private Chain]
           [Ethereum/Polygon]
           [IPFS/Arweave]
```

## 시작하기

### 웹사이트 운영자

1. **계정 생성**: BlockPass Ω 플랫폼에서 계정 생성
2. **서비스 등록**: 웹사이트 URL 등록
3. **API 키 발급**: 고유 API 키 및 SDK 다운로드
4. **SDK 통합**: 웹사이트에 SDK 추가

```html
<script src="blockpass-sdk.js"></script>
<script>
  const blockpass = new BlockPass({
    apiKey: 'your-api-key',
    domain: 'https://your-website.com'
  });

  blockpass.login('userId', 'password')
    .then(result => console.log('Logged in!', result));
</script>
```

## 프로젝트 구조

```
blockpass-omega/
├── backend/          # API 서버
├── frontend/         # 관리자 대시보드
├── sdk/             # BlockPass SDK
├── contracts/       # Smart Contracts
└── docs/            # 문서
```

## 기술 스택

- **Backend**: Node.js + Express + GraphQL
- **Frontend**: React + Tailwind CSS
- **Blockchain**: Ethereum (Sepolia), IPFS, Custom BDID Chain
- **Database**: PostgreSQL + MongoDB
- **SDK**: JavaScript/TypeScript

## API 엔드포인트

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | 로그인 요청 |
| POST | /api/auth/register | 계정 등록 + DID 생성 |
| GET | /api/auth/verify | 세션 유효성 검증 |
| GET | /api/auth/logs | 블록체인 로그 조회 |

## 보안 구조

| 항목 | BlockPass Ω 처리 방식 | 효과 |
|------|----------------------|------|
| 비밀번호 | 로컬 해시 후 체인 검증 | 서버 유출 불가 |
| 세션 | SmartContract 기반 | 탈중앙 만료관리 |
| 로그 | IPFS + Arweave | 삭제·조작 불가 |
| 인증 합의 | Private + Public Chain | 신뢰성 보장 |

## 라이선스

MIT License

## 문의

- Email: support@blockpass-omega.io
- GitHub: https://github.com/junhuhan99/tendsos
