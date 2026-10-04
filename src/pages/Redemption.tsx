import { useMemo, useState } from 'react'
import { products, formatNaira } from '../data/products'
import { useNotifications } from '../context/NotificationsContext'
import './Redemption.css'

interface ValidatedCode {
  valid: boolean
  code: string
  productId: string
  expiresAt: string
}

const sampleCodes: Record<string, { productId: string; expiresAt: string }> = {
  'A55-X92K-72PQ': { productId: '1', expiresAt: '31/12/2026' },
  'A55-7X92-ABCD': { productId: '1', expiresAt: '31/12/2026' },
  'IPH-8821-XK91': { productId: '3', expiresAt: '31/12/2026' },
  'SAM-22AA-77BC': { productId: '5', expiresAt: '15/06/2026' },
}

export default function Redemption() {
  const [code, setCode] = useState('')
  const [validated, setValidated] = useState<ValidatedCode | null>(null)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [redeemed, setRedeemed] = useState(false)
  const { addNotification } = useNotifications()

  const product = useMemo(() => {
    if (!validated) return undefined
    return products.find((p) => p.id === validated.productId)
  }, [validated])

  const handleVerify = () => {
    setError('')
    setRedeemed(false)
    setValidated(null)
    const normalized = code.trim().toUpperCase()
    if (!normalized) {
      setError('Please enter a redemption code.')
      return
    }
    const match = sampleCodes[normalized]
    if (!match) {
      setError(
        'This redemption code is not valid for this product or does not exist.',
      )
      return
    }
    const product = products.find((p) => p.id === match.productId)
    if (!product?.redemptionEligible) {
      setError('The product for this code is no longer eligible for redemption.')
      return
    }
    setValidated({
      valid: true,
      code: normalized,
      productId: match.productId,
      expiresAt: match.expiresAt,
    })
  }

  const handleRedeem = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setRedeemed(true)
    setConfirming(false)
    if (product) {
      addNotification({
        type: 'redemption',
        title: 'Product redeemed',
        message: `${product.name} has been redeemed successfully. It will be added to your account's orders.`,
        link: '/orders',
        productId: product.id,
      })
    }
  }

  const reset = () => {
    setCode('')
    setValidated(null)
    setError('')
    setConfirming(false)
    setRedeemed(false)
  }

  const redeemFlow = product && validated

  return (
    <main className="redeem-page">
      <div className="redeem-inner">
        <div className="redeem-header">
          <span className="material-symbols-outlined">
            redeem
          </span>
          <h1>Redeem Your Product</h1>
          <p>
            Enter your redemption code to claim your product — completely
            free of charge.
          </p>
        </div>

        {!redeemFlow ? (
          <div className="redeem-card">
            <label htmlFor="code-field" className="redeem-label">
              Enter your redemption code
            </label>
            <input
              id="code-field"
              className="code-input"
              placeholder="A55-7X92-ABCD"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={15}
            />
            {error && (
              <div className="redeem-error">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}
            <button className="verify-btn" onClick={handleVerify}>
              Verify Code
            </button>
            <div className="sample-codes">
              <span>Demo codes:</span>
              {Object.keys(sampleCodes).map((c) => (
                <button key={c} onClick={() => setCode(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="redeem-note">
              <span className="material-symbols-outlined">info</span>
              Codes are single-use and tied to a specific product. Redemption
              is final once confirmed.
            </div>
          </div>
        ) : confirming ? (
          <div className="redeem-card confirm-card">
            <span className="material-symbols-outlined confirm-icon">
              help
            </span>
            <h2>Are you sure?</h2>
            <p>You are about to redeem:</p>
            <div className="confirm-product">
              <img src={product.image} alt={product.name} />
              <div>
                <h3>{product.name}</h3>
                <span>Value: {formatNaira(product.price)}</span>
              </div>
            </div>
            <div className="confirm-code">
              <span>Redemption code:</span>
              <strong>{validated.code}</strong>
            </div>
            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleRedeem}>
                Confirm Redemption
              </button>
            </div>
          </div>
        ) : redeemed ? (
          <div className="redeem-card success-card">
            <span className="material-symbols-outlined success-icon">
              check_circle
            </span>
            <h2>Redemption Successful!</h2>
            <p>
              Your product has been redeemed. A confirmation has been sent to
              your account and email.
            </p>
            <div className="success-product">
              <img src={product.image} alt={product.name} />
              <div>
                <h3>{product.name}</h3>
                <span>{formatNaira(product.price)}</span>
              </div>
            </div>
            <div className="success-actions">
              <button className="cancel-btn" onClick={reset}>
                Redeem Another Code
              </button>
              <button className="confirm-btn" onClick={reset}>
                View My Account
              </button>
            </div>
          </div>
        ) : (
          <div className="redeem-card valid-card">
            <div className="valid-row">
              <span className="material-symbols-outlined verified">verified</span>
              <span>Code is valid</span>
            </div>
            <div className="validizable-product">
              <img src={product.image} alt={product.name} />
              <div>
                <span className="field-label">Product</span>
                <h3>{product.name}</h3>
                <span className="field-label">Value</span>
                <strong>{formatNaira(product.price)}</strong>
              </div>
            </div>
            <div className="valid-meta">
              <div>
                <span>Code</span>
                <strong>{validated.code}</strong>
              </div>
              <div>
                <span>Expires</span>
                <strong>{validated.expiresAt}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong className="active-status">ACTIVE</strong>
              </div>
            </div>
            <button className="verify-btn" onClick={handleRedeem}>
              Redeem Product
            </button>
            <button className="back-btn" onClick={reset}>
              Use a different code
            </button>
          </div>
        )}
      </div>
    </main>
  )
}