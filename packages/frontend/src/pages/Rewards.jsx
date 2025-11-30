import { useState, useEffect } from 'react'
import { Trophy, Gift, Award, TrendingUp, ShoppingBag, ExternalLink, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { rewardsAPI } from '../utils/api'
import '../styles/rewards.css'

// Certificate threshold - users need 100 points to claim certificate
const CERTIFICATE_POINTS_THRESHOLD = 100

export default function Rewards() {
  const [userRewards, setUserRewards] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [redemptions, setRedemptions] = useState([])
  const [certificate, setCertificate] = useState(null)
  const [certificateEligibility, setCertificateEligibility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [claimingCertificate, setClaimingCertificate] = useState(false)
  const [downloadingCertificate, setDownloadingCertificate] = useState(false)
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

      // Load certificate data
      let certificateData = null
      let eligibilityData = null
      try {
        const certRes = await rewardsAPI.getCertificate()
        certificateData = certRes.data.certificate || null
      } catch (err) {
        console.error('Failed to load certificate:', err)
      }

      try {
        const eligibilityRes = await rewardsAPI.checkCertificateEligibility()
        eligibilityData = eligibilityRes.data
      } catch (err) {
        console.error('Failed to check certificate eligibility:', err)
      }

      setUserRewards(rewardsData)
      setLeaderboard(leaderboardData.leaderboard)
      setUserRank(leaderboardData.userRank)
      setRedemptions(redemptionsData)
      setCertificate(certificateData)
      setCertificateEligibility(eligibilityData)
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

  const handleClaimCertificate = async () => {
    if (!confirm('Are you sure you want to claim your achievement certificate? This action cannot be undone.')) {
      return
    }

    setClaimingCertificate(true)
    setError(null)
    try {
      const response = await rewardsAPI.claimCertificate()
      
      // The response should include the full certificate object
      const claimedCertificate = response.data.certificate
      
      if (claimedCertificate) {
        // Set certificate immediately from response
        setCertificate(claimedCertificate)
        
        // Update eligibility state to show certificate is claimed
        setCertificateEligibility(prev => ({
          ...prev,
          canClaim: false,
          hasCertificate: true,
          reason: 'Certificate already claimed'
        }))
        
        alert('Certificate claimed successfully! You can now download it.')
      } else {
        // Fallback: fetch certificate if not in response
        console.warn('Certificate not in claim response, fetching...')
        try {
          const certResponse = await rewardsAPI.getCertificate()
          if (certResponse.data.certificate) {
            setCertificate(certResponse.data.certificate)
            alert('Certificate claimed successfully! You can now download it.')
          } else {
            // Reload all data as last resort
            loadRewardsData()
            alert('Certificate claimed successfully! Please refresh to see your certificate.')
          }
        } catch (certErr) {
          console.error('Failed to fetch certificate after claiming:', certErr)
          loadRewardsData()
          alert('Certificate claimed successfully! Please refresh to see your certificate.')
        }
      }
    } catch (err) {
      console.error('Certificate claim error:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to claim certificate'
      setError(errorMessage)
      
      // Show detailed error if available
      if (err.response?.data?.details) {
        console.error('Error details:', err.response.data.details)
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setClaimingCertificate(false)
    }
  }

  const handleDownloadCertificate = async () => {
    setDownloadingCertificate(true)
    setError(null)
    try {
      const response = await rewardsAPI.downloadCertificate()
      
      // Response.data is already a Blob when responseType is 'blob'
      const blob = response.data
      
      // Create download link for PDF
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PathoGen-Certificate-${certificate?.certificateNumber || 'Certificate'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      console.error('Certificate download error:', err)
      setError(err.response?.data?.message || 'Failed to download certificate. Please try again.')
    } finally {
      setDownloadingCertificate(false)
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

          {/* Certificate Section */}
          <div className="rewards-card certificate-card">
            <h2>
              <FileText size={24} />
              Achievement Certificate
            </h2>
            <p className="certificate-info">
              Claim your certificate after reaching {CERTIFICATE_POINTS_THRESHOLD} points!
            </p>
            
            {certificate ? (
              <div className="certificate-claimed">
                <div className="certificate-status">
                  <CheckCircle size={48} className="certificate-check-icon" />
                  <h3>Certificate Claimed!</h3>
                  <p>You have successfully claimed your achievement certificate.</p>
                  <div className="certificate-details">
                    <div className="certificate-detail-item">
                      <strong>Certificate Number:</strong>
                      <span>{certificate.certificateNumber}</span>
                    </div>
                    <div className="certificate-detail-item">
                      <strong>Points at Claim:</strong>
                      <span>{certificate.pointsAtTime.toLocaleString('en-IN')} points</span>
                    </div>
                    <div className="certificate-detail-item">
                      <strong>Claimed on:</strong>
                      <span>{new Date(certificate.claimedAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-large"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCertificate}
                  >
                    {downloadingCertificate ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Preparing Download...</span>
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        <span>Download Certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : certificateEligibility?.canClaim ? (
              <div className="certificate-eligible">
                <div className="certificate-status">
                  <Trophy size={48} className="certificate-trophy-icon" />
                  <h3>Congratulations! 🎉</h3>
                  <p>You've reached {certificateEligibility.points.toLocaleString('en-IN')} points!</p>
                  <p className="certificate-description">
                    You are eligible to claim your achievement certificate. This certificate recognizes your 
                    outstanding contribution to public health monitoring.
                  </p>
                  <button
                    className="btn btn-primary btn-large"
                    onClick={handleClaimCertificate}
                    disabled={claimingCertificate}
                  >
                    {claimingCertificate ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Claiming...</span>
                      </>
                    ) : (
                      <>
                        <Award size={20} />
                        <span>Claim Certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="certificate-progress">
                <div className="certificate-status">
                  <AlertCircle size={48} className="certificate-progress-icon" />
                  <h3>Keep Going!</h3>
                  <p className="certificate-progress-text">
                    {certificateEligibility?.points 
                      ? `You have ${certificateEligibility.points.toLocaleString('en-IN')} points. ` 
                      : `You have ${totalPoints.toLocaleString('en-IN')} points. `}
                    {certificateEligibility?.reason || `You need ${CERTIFICATE_POINTS_THRESHOLD - (certificateEligibility?.points || totalPoints)} more points to claim your certificate.`}
                  </p>
                  <div className="certificate-progress-bar">
                    <div 
                      className="certificate-progress-fill"
                      style={{ 
                        width: `${Math.min(((certificateEligibility?.points || totalPoints) / CERTIFICATE_POINTS_THRESHOLD) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="certificate-progress-stats">
                    <span>
                      {certificateEligibility?.points || totalPoints} / {CERTIFICATE_POINTS_THRESHOLD} points
                    </span>
                    <span>
                      {Math.round(((certificateEligibility?.points || totalPoints) / CERTIFICATE_POINTS_THRESHOLD) * 100)}% Complete
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

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

