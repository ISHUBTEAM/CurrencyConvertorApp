import React, { useState, useEffect } from 'react';
import swap from './images/swap.png';
import './index.css';

const App = () => {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [fromCurrency, setFromCurrency] = useState(
    localStorage.getItem('fromCurrency') || 'USD'
  );
  const [toCurrency, setToCurrency] = useState(
    localStorage.getItem('toCurrency') || 'ETB'
  );
  const [exchangeRate, setExchangeRate] = useState();
  const [amount, setAmount] = useState(
    parseFloat(localStorage.getItem('amount')) || 1
  );
  const [convertedCurrency, setconvertedCurrency] = useState(
    parseFloat(localStorage.getItem('convertedCurrency')) || null
  );
  const [isResultVisible, setIsResultVisible] = useState(
    localStorage.getItem('isResultVisible') === 'true'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrencies = async () => {
      const url = `https://currency-exchange-rate-api1.p.rapidapi.com/latest?base=${fromCurrency}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'currency-exchange-rate-api1.p.rapidapi.com',
          'x-rapidapi-key': 'b39770258fmshd713c7a16192fa4p17ca1ejsnad16225d8aaa',
        },
      };
  
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        const currencies = Object.keys(data.data);
        setCurrencyOptions(currencies);
  
        if (data.data[toCurrency]) {
          setExchangeRate(data.data[toCurrency].rate);
        } else {
          setError('Exchange rate not available for the selected currency.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch exchange rates. Please try again later.');
      }
    };
  
    fetchCurrencies();
  }, [fromCurrency, toCurrency]); 

  const handleConvert = () => {
    if (fromCurrency && toCurrency && exchangeRate) {
      const result = amount * exchangeRate;
      setconvertedCurrency(result.toFixed(2));
      setIsResultVisible(true);

      localStorage.setItem('fromCurrency', fromCurrency);
      localStorage.setItem('toCurrency', toCurrency);
      localStorage.setItem('amount', amount);
      localStorage.setItem('convertedCurrency', result.toFixed(2));
      localStorage.setItem('isResultVisible', true);
    }
  };

  const swapHandler = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);

    localStorage.setItem('fromCurrency', toCurrency);
    localStorage.setItem('toCurrency', temp);
  };

  const clearDataHandler = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="currency-convertor">
      <h2 className="tittle">Currency Convertor</h2>
      <form className="convertor-form">
        <div className="form-description">
          <label className="form-label">Pleas Enter Amount</label>
          <input
            type="number"
            className="currency-input"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              localStorage.setItem('amount', e.target.value);
            }}
            required
          />
        </div>

        <div className="form-description form-currency-group">
          <div className="form-section">
            <label className="form-label">From</label>
            <div className="currency-select">
              <img
                src={`https://flagsapi.com/${fromCurrency.substring(0, 2)}/flat/64.png`}
                alt="Flag"
              />
              <select
                className="currency-dropdown"
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  localStorage.setItem('fromCurrency', e.target.value);
                }}
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="swap-icon" onClick={swapHandler}>
            <img src={swap} alt="Swap" />
          </div>

          <div className="form-section">
            <label className="form-label">To</label>
            <div className="currency-select">
              <img
                src={`https://flagsapi.com/${toCurrency.substring(0, 2)}/flat/64.png`}
                alt="Flag"
              />
              <select
                className="currency-dropdown"
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  localStorage.setItem('toCurrency', e.target.value);
                }}
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="submit-btn"
          onClick={handleConvert}
        >
          Convert {fromCurrency} to {toCurrency}
        </button>

        {isResultVisible && (
          <p className="exchange-rate-result">
            {amount} {fromCurrency} = {convertedCurrency} {toCurrency}
          </p>
        )}

        <button
          type="button"
          className="clear-btn"
          onClick={clearDataHandler}
        >
          Clear Data
        </button>

        <p className="storage-notice">
          Your selections are stored locally.{' '}
          <button onClick={clearDataHandler}>Clear data</button>
        </p>
      </form>
    </div>
  );
};

export default App;