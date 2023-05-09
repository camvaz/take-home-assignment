import { useCallback, useEffect, useRef, useState } from 'react'

function App() {
  const formRef = useRef()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('stale')
  const [response, setResponse] = useState({
    page_size: 0,
    total: 0,
    results: [],
  })

  const getQuery = useCallback((data = { page: 0, page_size: 0 }) => {
    if (!formRef.current) return null
    const formData = new FormData(formRef.current)
    const country = formData.get('country')
    const pageQuery = `${data.page > 0 ? `&page=${data.page}` : ''}${
      data.page_size > 0 ? `&page_size=${data.page_size}` : ''
    }`

    return `/countries?query=${country}${pageQuery}`
  }, [])

  const fetchData = useCallback(async (query) => {
    setStatus('loading')
    try {
      const response = await fetch(query)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setResponse(data)
      setStatus('stale')
    } catch (error) {
      setStatus('error')
      console.error('Fetch error: ', error)
    }
  }, [])

  useEffect(() => {
    if (query) {
      const abortController = new AbortController()
      fetchData(query, { signal: abortController.signal })

      return () => {
        abortController.abort()
      }
    }
  }, [query, fetchData])

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const query = getQuery({ page: 1, page_size: response.page_size })
      setQuery(query)
    },
    [getQuery, response.page_size]
  )

  const handleClick = useCallback(
    (e) => {
      const newPage = parseInt(e.target.getAttribute('name'))
      const query = getQuery({ page: newPage, page_size: response.page_size })
      setQuery(query)
    },
    [getQuery, response.page_size]
  )

  const { page_size, total, results } = response

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
