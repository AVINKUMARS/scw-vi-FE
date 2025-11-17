import { Zap, TrendingUp } from 'lucide-react'
import { PLAN_CONFIGS, formatTokens, type UsageResponse } from '../services/payment'

interface TokenUsageDisplayProps {
  usage: UsageResponse | null
  isLoading?: boolean
  compact?: boolean
  onUpgrade?: () => void
}

export default function TokenUsageDisplay({ usage, isLoading = false, compact = false, onUpgrade }: TokenUsageDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    )
  }

  if (!usage) {
    return null
  }

  const planConfig = PLAN_CONFIGS[usage.plan]
  const percentUsed = (usage.token_used / usage.token_quota) * 100
  const isLowOnTokens = percentUsed > 80

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <Zap size={16} className="text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          {formatTokens(usage.remaining)} / {formatTokens(usage.token_quota)}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Token Usage</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{planConfig.name} Plan</p>
          </div>
        </div>
        {onUpgrade && usage.plan !== 'premium' && (
          <button
            onClick={onUpgrade}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Upgrade →
          </button>
        )}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Used</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatTokens(usage.token_used)}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Remaining</p>
          <p className={`text-lg font-bold ${isLowOnTokens ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatTokens(usage.remaining)}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Total</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatTokens(usage.token_quota)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Usage Progress</p>
          <p className="text-xs font-semibold text-neutral-900 dark:text-white">{Math.round(percentUsed)}%</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isLowOnTokens ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Warning */}
      {isLowOnTokens && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-semibold">Low on tokens!</span> You're using {Math.round(percentUsed)}% of your quota.
            {onUpgrade && ' Consider upgrading to continue uninterrupted.'}
          </p>
        </div>
      )}

      {/* Plan End Date */}
      {usage.plan_end_at && (
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <TrendingUp size={14} />
          <span>Plan renews on {new Date(usage.plan_end_at).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}
