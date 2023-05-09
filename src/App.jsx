import { useCallback, useEffect, useRef, useState } from 'react'

function App() {
  const formRef = useRef()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('stale')
  const [{ page_size, total, results }, setResponse] = useState({
    page_size: 0,
    total: 0,
    results: [],
  })

  const getQuery = (data = { page: 0, page_size: 0 }) => {
    if (!formRef.current) return null
    const formData = new FormData(formRef.current)
    const country = formData.get('country')
    const pageQuery = `${data.page > 0 ? `&page=${data.page}` : ''}${
      data.page_size > 0 ? `&page_size=${data.page_size}` : ''
    }`

    return `/countries?query=${country}${pageQuery}`
  }

  useEffect(() => {
    const abortController = new AbortController()

    setStatus('loading')
    fetch(query, { signal: abortController.signal })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        return Promise.reject()
      })
      .then(setResponse)
      .catch(console.error)
      .finally(() => setStatus('stale'))

    return () => {
      abortController.abort()
    }
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    const query = getQuery({ page: 1, page_size })
    setQuery(query)
  }

  const handleClick = useCallback(
    (e) => {
      const newPage = parseInt(e.target.getAttribute('name'))
      const query = getQuery({ page: newPage, page_size })
      setQuery(query)
    },
    [page_size]
  )

  return (
    <main className="main">
      <section className="searchBox">
        <form ref={formRef} onSubmit={handleSubmit}>
          <input name="country" type="text"></input>
          <button type="submit">Search</button>
        </form>
      </section>
      <section className="results">
        {status === 'loading' ? (
          <span>Loading...</span>
        ) : (
          <>
            <div className="results__paging">
              {page_size <= 0
                ? []
                : Array.from({
                    length: Math.ceil(total / page_size),
                  }).map((_, i) => (
                    <button key={i} onClick={handleClick} name={i + 1}>
                      {i + 1}
                    </button>
                  ))}
            </div>
            <div className="results__list">
              {results.map(
                ({ capital, code, continent, flag_4x3, name: countryName }) => (
                  <div className="results__item" key={code}>
                    <img
                      width={48}
                      src={flag_4x3}
                      alt={`${countryName} flag`}
                    />
                    <p>{countryName}</p>
                    <ul>
                      <li>Continent: {continent}</li>
                      <li>Capital: {capital}</li>
                    </ul>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default App
