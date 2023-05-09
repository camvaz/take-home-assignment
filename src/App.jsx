import { useCallback, useRef, useState } from 'react'

function App() {
  const formRef = useRef()
  const [{ page, page_size, total, results }, setResponse] = useState({
    page: 0,
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const query = getQuery({ page, page_size })

    fetch(query)
      .then((res) => res.json())
      .then(setResponse)
      .catch(console.error)
  }

  const handleClick = useCallback(
    (e) => {
      const newPage = parseInt(e.target.getAttribute('name'))
      const query = getQuery({ page: newPage, page_size })

      fetch(query)
        .then((res) => res.json())
        .then(setResponse)
        .catch(console.error)
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
        <div className="results__paging">
          {Array.from({
            length: page_size > 0 ? Math.ceil(total / page_size) : 0,
          }).map((_, i) => (
            <button key={i} onClick={handleClick} name={i + 1}>
              {i}
            </button>
          ))}
        </div>
        <div className="results__list">
          {results.map(
            ({ capital, code, continent, flag_4x3, name: countryName }) => (
              <div className="results__item" key={code}>
                <img width={48} src={flag_4x3} alt={`${countryName} flag`} />
                <p>{countryName}</p>
                <ul>
                  <li>Continent: {continent}</li>
                  <li>Capital: {capital}</li>
                </ul>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  )
}

export default App
