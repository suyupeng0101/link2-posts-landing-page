# 积分扣费与流水规则

## 计价与扣费
- 1 credit = $0.01
- 每次点击生成扣 12 credits
- 充值包为按量包，到账后长期有效

## 扣费流程（生成任务）
1. 创建任务前读取 `credits_balance.balance`
2. 余额不足则提示充值并阻止创建任务
3. 余额充足则扣减 12 credits，并写入流水
4. 将本次扣费记录到 `generation_jobs.credits_spent`

建议写入内容：
- `credits_ledger.change_amount = -12`
- `credits_ledger.reason = 'generation'`
- `credits_ledger.related_job_id = generation_jobs.id`
- `credits_ledger.note = 'content generation'`（可选）

## 入账流程（支付成功）
1. PayPal/其他支付回调确认成功
2. 写入 `payments`，并确保幂等
3. 增加 `credits_balance.balance`
4. 写入一条积分流水

建议写入内容：
- `payments.amount_cents` 与 `credits_granted`
- `credits_ledger.change_amount = credits_granted`
- `credits_ledger.reason = 'payment'`
- `credits_ledger.related_payment_id = payments.id`
- `credits_ledger.note = 'credit recharge'`（可选）

## 幂等与对账要点
- 支付回调需以 `provider + provider_payment_id` 幂等
- 余额更新与流水写入建议放在同一事务中
- 账本总和应可回溯到余额（核对 period 内流水）
