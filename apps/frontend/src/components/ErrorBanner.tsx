import { useError } from "../context/ErrorContext"

export function ErrorBanner() {
  const { errorMessage, setError } = useError()

  if (!errorMessage) return null

  return (
    <div className='error-banner' role='alert' aria-live='assertive'>
      <p className='error-banner__message'>{errorMessage}</p>
      <button
        type='button'
        className='error-banner__close'
        aria-label='Dismiss error'
        onClick={() => setError(null)}
      >
        ✕
      </button>
    </div>
  )
}
