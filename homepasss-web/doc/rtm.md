# Requirements Traceability Matrix

| REQ-ID | Description | Source | Tests |
| --- | --- | --- | --- |
| REQ-1 | Preserve Kotlin parity for mock data, repositories, and deterministic formatting helpers across the React port. | `context.txt` Compose/HomeViewModel excerpts | `src/data/mockData.test.ts`, `src/data/houseRepository.test.ts`, `src/utils/formatters.test.ts` |
| REQ-2 | Profile screen must replicate the Solana wallet screenshot (totals, dynamics, asset distribution, and property cards). | User request: “Можешь исправить Profile Что бы он содержал вот эту информацию (она на скриншоте)” | `src/utils/profileMetrics.test.ts` |
| REQ-3 | “My objects” must display on-chain Solana token holdings without hardcoded Moscow data. | User request: “MyOBjects это токены. Мы ничего не хардкодим” | `src/utils/tokenHoldings.test.ts`, `src/utils/profileMetrics.test.ts` |
