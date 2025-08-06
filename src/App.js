import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [minuteRate, setMinuteRate] = useState(100); // 初期単価: 100円/分
  const [newRate, setNewRate] = useState(minuteRate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handleRateChange = (e) => {
    setNewRate(e.target.value);
  };

  const handleRateSubmit = (e) => {
    e.preventDefault();
    const rate = parseInt(newRate, 10);
    if (!isNaN(rate) && rate > 0) {
      setMinuteRate(rate);
      setIsModalOpen(false);
    } else {
      alert('有効な数値を入力してください。');
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  const calculateFee = () => {
    const fee = (time / 60) * minuteRate;
    return fee.toFixed(2); // 小数点以下2桁まで表示
  };

  const openModal = () => {
    setNewRate(minuteRate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>コンサル料金計算</h1>
        <div className="stopwatch">
          <div className="time-display">{formatTime(time)}</div>
          <div className="controls">
            <button onClick={handleStartStop}>
              {isRunning ? 'ストップ' : 'スタート'}
            </button>
            <button onClick={handleReset}>リセット</button>
          </div>
        </div>
        <div className="fee-display">
          <h2>現在の料金: ￥{calculateFee()}</h2>
        </div>
        <div className="rate-config">
          <button onClick={openModal}>単価を設定</button>
          <p>現在の設定単価: ￥{minuteRate.toLocaleString()}/分</p>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>分単価を設定</h2>
            <form onSubmit={handleRateSubmit}>
              <input
                type="number"
                value={newRate}
                onChange={handleRateChange}
                min="1"
                className="modal-input"
              />
              <div className="modal-actions">
                <button type="submit">設定</button>
                <button type="button" onClick={closeModal}>キャンセル</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
