# Claude Desktop MCP 연결 확인 가이드

## 1. 클라우드 데스크톱 설정 확인

올바른 설정 예시:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "test_86bd7da053eab9a9328c1008c8c2c1a75b82a506727038e778a8ad5122dc6633efe8d04e6d233bd35cf2fabdeb93fb0d"
      }
    }
  }
}
```

## 2. 문제 해결 단계

### A. MCP 서버 연결 확인
Claude Desktop를 재시작한 후 다음을 요청해보세요:
```
What MCP tools are available?
```

### B. 헬스체크 테스트
```
Run a health check on the MapleStory SEA server
```

### C. 간단한 랭킹 요청
```
Get the first page of overall rankings for MapleStory SEA
```

## 3. 예상되는 결과

### 성공한 경우:
- MCP 도구 목록에 14개의 MapleStory SEA 도구가 표시됨
- 헬스체크에서 API 상태가 "unhealthy"로 표시될 수 있음 (API 키 권한 문제)
- 랭킹 요청에서 "Access Denied" 에러가 표시될 수 있음

### 실패한 경우:
- MCP 도구가 표시되지 않음
- "Server not found" 또는 연결 에러
- 도구 호출 시 아무 응답이 없음

## 4. 일반적인 문제와 해결책

### 문제 1: MCP 서버가 목록에 없음
- Claude Desktop 완전 재시작
- 설정 파일 경로 확인
- JSON 문법 오류 확인

### 문제 2: API 키 관련 에러
- NEXON 개발자 포털에서 API 키 확인
- API 키 권한 설정 확인
- SEA API 접근 권한 확인

### 문제 3: 도구 호출 실패
- 파라미터 형식 확인
- 캐릭터명은 영문+숫자만 사용
- 세계명은 Aquila, Bootes, Cassiopeia, Delphinus 중 하나

## 5. 현재 상태

✅ MCP 서버가 빌드되고 14개 도구를 제공함
✅ STDIO 모드에서 정상 작동 확인
⚠️ API 키에 SEA API 접근 권한이 없어 실제 데이터 조회 불가
⚠️ 에러 메시지가 "[object Object]"로 표시되는 문제 (현재 수정 중)

실제 작동하는 NEXON API 키가 있다면 모든 기능이 정상 작동할 것으로 예상됩니다.