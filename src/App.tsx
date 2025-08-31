// Объявление глобального типа для Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: { user?: { id?: string } };
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
      };
    };
  }
}

import { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<any[]>([]); // Список QR-кодов

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const savedToken = window.Telegram.WebApp.getItem('token');
      const savedUserId = window.Telegram.WebApp.getItem('userId');
      console.log('Saved Token:', savedToken, 'Saved UserId:', savedUserId); // Отладка
      if (savedToken && savedUserId) {
        setToken(savedToken);
        setUserId(savedUserId);
        setIsAuthenticated(true);
        fetchQrCodes(savedToken); // Загружаем QR-коды при загрузке
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = `/api/?api_key=${encodeURIComponent(token)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      console.log('Auth response:', data); // Отладка

      if (response.ok && data && typeof data.success !== 'undefined' && data.success) {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.setItem('token', token);
          window.Telegram.WebApp.setItem('userId', data.data.user_id);
        }
        setUserId(data.data.user_id);
        setIsAuthenticated(true); // Устанавливаем сразу
        console.log('Authenticated, UserId set to:', data.data.user_id); // Отладка
        await fetchQrCodes(token); // Ждём загрузку QR-кодов
      } else {
        setError(data.message || 'Неверный токен или ошибка сервера');
      }
    } catch (err) {
      setError('Ошибка при подключении к API');
    }
  };

  const fetchQrCodes = async (token: string) => {
    try {
      const url = `/api/list/?api_key=${encodeURIComponent(token)}`;
      console.log('Fetch QR Codes URL:', url); // Отладка локального URL
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('QR list response:', data); // Отладка ответа

      if (response.ok && data && typeof data.success !== 'undefined' && data.success) {
        if (data.data && data.data.content) {
          setQrCodes(data.data.content);
          console.log('QR Codes set to:', data.data.content.length, 'items'); // Отладка
        } else {
          setQrCodes([]);
          setError('Список QR-кодов отсутствует в ответе');
        }
      } else {
        setError('Не удалось загрузить QR-коды');
      }
    } catch (err) {
      setError('Ошибка при загрузке QR-кодов');
    }
  };

  // Синхронизация и отладка состояния
  useEffect(() => {
    console.log('State updated - isAuthenticated:', isAuthenticated, 'userId:', userId, 'qrCodes length:', qrCodes.length);
    if (isAuthenticated && userId && qrCodes.length > 0) {
      console.log('Ready to render with qrCodes:', qrCodes.slice(0, 2)); // Первые 2 элемента для отладки
    }
  }, [isAuthenticated, userId, qrCodes]);

  // Явная проверка рендеринга
  if (isAuthenticated && userId) {
    console.log('Rendering authenticated section with qrCodes length:', qrCodes.length);
    return (
      <div className="container mt-4">
        <h1 className="display-4">Добро пожаловать, User ID: {userId}!</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <h2 className="mt-4">Ваши QR-коды:</h2>
        {qrCodes.length > 0 ? (
          <ul className="list-group">
            {qrCodes.map((qr) => (
              <li key={qr.ID} className="list-group-item">
                <strong>{qr.NAME}</strong> (Тип: {qr.TYPE})
                <br />
                <a href={qr.CONTENT} target="_blank" rel="noopener noreferrer">
                  {qr.CONTENT}
                </a>
                {qr.QR_IMAGE && (
                  <img
                    src={`https://g-qr.ru${qr.QR_IMAGE}`}
                    alt={qr.NAME}
                    className="img-thumbnail mt-2"
                    style={{ maxWidth: '100px' }}
                  />
                )}
                {qr.SHORT_LINK && (
                  <p>Короткая ссылка: {qr.SHORT_LINK}</p>
                )}
                {qr.PARAMS && Object.keys(qr.PARAMS).length > 0 && (
                  <p>Параметры: {JSON.stringify(qr.PARAMS)}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">QR-коды не найдены.</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="display-4">QR Mini App</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="token" className="form-label">Введите токен с сайта</label>
          <input
            type="text"
            className="form-control"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Ваш api_key (например, 5af771cc3f31d07b66dae88f8cda14b0)"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">Войти</button>
      </form>
    </div>
  );
}

export default App;
