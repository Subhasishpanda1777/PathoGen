import { useState, useEffect } from 'react'
import { Trophy, Gift, Award, TrendingUp, ShoppingBag, ExternalLink } from 'lucide-react'
import { rewardsAPI } from '../utils/api'
import '../styles/rewards.css'

export default function Rewards() {
  const [userRewards, setUserRewards] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRewardsData()
    
    // Refresh data every 30 seconds to catch new points
    const interval = setInterval(() => {
      loadRewardsData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadRewardsData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load rewards data with individual error handling
      let rewardsData = null
      let leaderboardData = { leaderboard: [], userRank: null }
      let redemptionsData = []

      try {
        const rewardsRes = await rewardsAPI.getMyRewards()
        rewardsData = rewardsRes.data
      } catch (err) {
        console.error('Failed to load user rewards:', err)
        // Set default if API fails
        rewardsData = {
          contribution: {
            totalPoints: 0,
            verifiedReports: 0,
            totalReports: 0,
            badgesCount: 0,
          },
          badges: [],
          recentRewards: [],
        }
      }

      try {
        const leaderboardRes = await rewardsAPI.getLeaderboard()
        leaderboardData = {
          leaderboard: leaderboardRes.data.leaderboard || [],
          userRank: leaderboardRes.data.userRank || null,
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
        // Continue with empty leaderboard
      }

      try {
        const redemptionsRes = await rewardsAPI.getRedemptions()
        redemptionsData = redemptionsRes.data.redemptions || []
      } catch (err) {
        console.error('Failed to load redemptions:', err)
        // Continue with empty redemptions
      }

      setUserRewards(rewardsData)
      setLeaderboard(leaderboardData.leaderboard)
      setUserRank(leaderboardData.userRank)
      setRedemptions(redemptionsData)
    } catch (err) {
      console.error('Failed to load rewards data:', err)
      setError('Failed to load some rewards data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (giftCardType) => {
    if (!confirm(`Are you sure you want to redeem 200 points for a ${giftCardType === 'flipkart' ? 'Flipkart' : 'Amazon'} gift card worth Rs. 200?`)) {
      return
    }

    setRedeeming(true)
    setError(null)
    try {
      await rewardsAPI.redeemGiftCard(giftCardType)
      alert(`Gift card redemption request submitted successfully! You will receive your gift card code via email once processed.`)
      loadRewardsData() // Reload to update points
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem gift card')
    } finally {
      setRedeeming(false)
    }
  }

  const totalPoints = userRewards?.contribution?.totalPoints || 0
  const verifiedReports = userRewards?.contribution?.verifiedReports || 0
  const canRedeem = totalPoints >= 200

  if (loading) {
    return (
      <div className="rewards-page">
        <div className="rewards-loading">
          <div className="loading-spinner"></div>
          <p>Loading rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rewards-page">
      <main className="rewards-main">
        <div className="container">
          {/* Header */}
          <div className="rewards-header">
            <div className="rewards-header-icon">
              <Trophy size={48} />
            </div>
            <h1>Rewards & Leaderboard</h1>
            <p>Earn points by submitting verified reports and redeem them for gift cards!</p>
          </div>

          {/* User Points Card */}
          <div className="rewards-card points-card">
            <div className="points-display">
              <div className="points-icon">
                <Award size={32} />
              </div>
              <div className="points-content">
                <div className="points-label">Your Total Points</div>
                <div className="points-value">{totalPoints.toLocaleString('en-IN')}</div>
                <div className="points-info">
                  {verifiedReports} verified report{verifiedReports !== 1 ? 's' : ''} • 5 points per report
                </div>
              </div>
            </div>
            {userRank && (
              <div className="user-rank-badge">
                <TrendingUp size={16} />
                <span>Rank #{userRank.rank}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="rewards-alert rewards-alert-error">
              {error}
            </div>
          )}

          {/* Gift Card Redemption */}
          <div className="rewards-card redemption-card">
            <h2>
              <Gift size={24} />
              Redeem Points for Gift Cards
            </h2>
            <p className="redemption-info">
              Redeem 200 points for a gift card worth Rs. 200
            </p>
            <div className="gift-cards-grid">
              <div className={`gift-card-option ${!canRedeem ? 'disabled' : ''}`}>
                <div className="gift-card-icon flipkart">
                  <ShoppingBag size={32} />
                </div>
                <h3>Flipkart Gift Card</h3>
                <p className="gift-card-value">Rs. 200</p>
                <p className="gift-card-points">200 points required</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleRedeem('flipkart')}
                  disabled={!canRedeem || redeeming}
                >
                  {redeeming ? 'Processing...' : canRedeem ? 'Redeem Now' : `Need ${200 - totalPoints} more points`}
                </button>
              </div>

              <div className={`gift-card-option ${!canRedeem ? 'disabled' : ''}`}>
                <div className="gift-card-icon amazon">
                  <ShoppingBag size={32} />
                </div>
                <h3>Amazon Gift Card</h3>
                <p className="gift-card-value">Rs. 200</p>
                <p className="gift-card-points">200 points required</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleRedeem('amazon')}
                  disabled={!canRedeem || redeeming}
                >
                  {redeeming ? 'Processing...' : canRedeem ? 'Redeem Now' : `Need ${200 - totalPoints} more points`}
                </button>
              </div>
            </div>
          </div>

          {/* Redemption History */}
          {redemptions.length > 0 && (
            <div className="rewards-card">
              <h2>Redemption History</h2>
              <div className="redemptions-list">
                {redemptions.map((redemption) => (
                  <div key={redemption.id} className="redemption-item">
                    <div className="redemption-info">
                      <div className="redemption-type">
                        {redemption.giftCardType === 'flipkart' ? '🛒' : '📦'} {redemption.giftCardType.charAt(0).toUpperCase() + redemption.giftCardType.slice(1)} Gift Card
                      </div>
                      <div className="redemption-details">
                        <span>Rs. {redemption.giftCardValue}</span>
                        <span>•</span>
                        <span>{redemption.pointsUsed} points</span>
                        <span>•</span>
                        <span className={`status status-${redemption.status}`}>{redemption.status}</span>
                      </div>
                      {redemption.giftCardCode && (
                        <div className="redemption-code">
                          Code: <strong>{redemption.giftCardCode}</strong>
                        </div>
                      )}
                    </div>
                    <div className="redemption-date">
                      {new Date(redemption.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="rewards-card leaderboard-card">
            <h2>
              <Trophy size={24} />
              Top Contributors
            </h2>
            <div className="leaderboard-list">
              {leaderboard.length === 0 ? (
                <div className="empty-state">No leaderboard data available</div>
              ) : (
                leaderboard.map((user, index) => (
                  <div key={user.userId} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                    <div className="leaderboard-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${user.rank}`}
                    </div>
                    <div className="leaderboard-user">
                      <div className="leaderboard-name">{user.name || user.email}</div>
                      <div className="leaderboard-stats">
                        {user.verifiedReports} verified reports • {user.badgesCount} badges
                      </div>
                    </div>
                    <div className="leaderboard-points">
                      {user.totalPoints.toLocaleString('en-IN')} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Badges Section */}
          {userRewards?.badges && userRewards.badges.length > 0 && (
            <div className="rewards-card">
              <h2>Your Badges</h2>
              <div className="badges-grid">
                {userRewards.badges.map((badge) => (
                  <div key={badge.id} className="badge-item">
                    <div className="badge-icon">{badge.icon || '🏅'}</div>
                    <div className="badge-name">{badge.badgeName}</div>
                    <div className="badge-description">{badge.description}</div>
                    <div className="badge-date">
                      Earned {new Date(badge.earnedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

