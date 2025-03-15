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
  const [currencyInsights, setCurrencyInsights] = useState("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [travelTips, setTravelTips] = useState(null);
  const [showTravelTips, setShowTravelTips] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [showAssistant, setShowAssistant] = useState(false);

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
        
        // Check if data has the expected structure
        if (data && data.data) {
          const currencies = Object.keys(data.data);
          setCurrencyOptions(currencies);
    
          if (data.data[toCurrency]) {
            setExchangeRate(data.data[toCurrency].rate);
          } else {
            setError('Exchange rate not available for the selected currency.');
          }
        } else {
          console.error('Unexpected API response:', data);
          setError('Received unexpected data format from the API.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch exchange rates. Please try again later.');
      }
    };
  
    fetchCurrencies();
  }, [fromCurrency, toCurrency]);

  // Function to generate currency insights using direct fetch
  const generateCurrencyInsights = async () => {
    setIsLoadingInsights(true);
    
    try {
      const prompt = `You are a helpful currency conversion assistant that provides brief, interesting insights about currency conversions.

Provide a brief, interesting insight about converting ${amount} ${fromCurrency} to ${toCurrency}.
Include information about:
1. The relative strength of these currencies
2. What this amount could typically buy in the destination country
3. Any recent trends in this currency pair
Keep it concise (max 3 sentences) and conversational.`;
      
      // Using the correct endpoint for Gemini 1.5 Flash
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAkfJpF6ZdjEapZYuf6La2LBf_KNdYM5rA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        })
      });
      
      const data = await response.json();
      console.log("Gemini API response:", data); // Debug log
      
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].text) {
          setCurrencyInsights(content.parts[0].text);
        } else {
          console.error("Unexpected content structure:", content);
          setCurrencyInsights("Unable to parse insights from the API response.");
        }
      } else {
        console.error("Unexpected API response structure:", data);
        
        // Check if there's an error message in the response
        if (data && data.error) {
          console.error("API error:", data.error);
          setCurrencyInsights(`API Error: ${data.error.message || "Unknown error"}`);
        } else {
          setCurrencyInsights("Unable to generate insights at this time.");
        }
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      setCurrencyInsights("Error connecting to the insights service.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const generateTravelRecommendations = async () => {
    try {
      const prompt = `Based on the current exchange rate where ${amount} ${fromCurrency} = ${convertedCurrency} ${toCurrency}, 
      suggest 2-3 travel tips for someone visiting a country that uses ${toCurrency}. 
      Focus on value for money and affordability. Keep it brief and helpful.`;
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAkfJpF6ZdjEapZYuf6La2LBf_KNdYM5rA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      });
      
      const data = await response.json();
      
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        setTravelTips(data.candidates[0].content.parts[0].text);
      } else {
        setTravelTips("Unable to load travel recommendations at this time.");
      }
    } catch (error) {
      console.error("Error generating travel tips:", error);
      setTravelTips("Unable to load travel recommendations at this time.");
    }
  };

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
      
      // Generate insights after conversion
      generateCurrencyInsights();
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

  const processNaturalLanguageQuery = async () => {
    try {
      const prompt = `Act as a currency conversion assistant. Parse this query and extract the amount, source currency, and target currency: "${naturalLanguageInput}"
      If you can identify these elements, respond with a JSON object containing amount, fromCurrency, and toCurrency.
      If you cannot identify these elements, provide a helpful response explaining what information is needed.`;
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAkfJpF6ZdjEapZYuf6La2LBf_KNdYM5rA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      });
      
      const data = await response.json();
      
      const text = data.candidates[0].content.parts[0].text;
      
      try {
        // Try to parse as JSON
        const parsedResult = JSON.parse(text);
        if (parsedResult.amount && parsedResult.fromCurrency && parsedResult.toCurrency) {
          setAmount(parsedResult.amount);
          setFromCurrency(parsedResult.fromCurrency);
          setToCurrency(parsedResult.toCurrency);
          setAssistantResponse(`I'll convert ${parsedResult.amount} ${parsedResult.fromCurrency} to ${parsedResult.toCurrency} for you.`);
          // Trigger conversion after a short delay
          setTimeout(handleConvert, 500);
        } else {
          setAssistantResponse(text);
        }
      } catch (e) {
        // Not JSON, just display the text response
        setAssistantResponse(text);
      }
    } catch (error) {
      console.error("Error processing natural language query:", error);
      setAssistantResponse("I'm having trouble understanding that request. Please try again.");
    }
  };

  return (
    <div className="currency-convertor">
      <h2 className="tittle">Currency Convertor</h2>
      <div className="convertor-form">
        <div className="form-description">
          <label className="form-label">Amount</label>
          <input
            type="number"
            className="currency-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="form-description form-currency-group">
          <div>
            <label className="form-label">From</label>
            <div className="currency-select">
              <select
                className="currency-dropdown"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="swap-icon" onClick={swapHandler}>
            <img src={swap} alt="swap" />
          </div>
          
          <div>
            <label className="form-label">To</label>
            <div className="currency-select">
              <select
                className="currency-dropdown"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <button className="submit-btn" onClick={handleConvert}>
          Convert
        </button>
        
        <button className="clear-btn" onClick={clearDataHandler}>
          Clear Data
        </button>
        
        {error && <p className="error-message">{error}</p>}
        
        {isResultVisible && (
          <div className="exchange-rate-result">
            {amount} {fromCurrency} = {convertedCurrency} {toCurrency}
          </div>
        )}
        
        {isResultVisible && (
          <div className="insights-container">
            {isLoadingInsights ? (
              <p className="loading-insights">Loading currency insights...</p>
            ) : (
              <p className="currency-insights">{currencyInsights}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;