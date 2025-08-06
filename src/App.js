import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [minuteRate, setMinuteRate] = useState(100); // 初期単価: 100円/分
  const [newRate, setNewRate] = useState(minuteRate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetButtonPressed, setIsResetButtonPressed] = useState(false); // リセットボタンの状態

  const timerRef = useRef(null);
  const startTimeRef = useRef(0); // タイマー開始時刻を記録
  const lastPauseTimeRef = useRef(0); // バックグラウンドに移行した時刻を記録

  useEffect(() => {
    if (isRunning) {
      if (startTimeRef.current === 0) { // 初めてスタートする場合
        startTimeRef.current = Date.now() - time * 1000; // 現在のtimeから逆算して開始時刻を設定
      } else if (lastPauseTimeRef.current !== 0) { // バックグラウンドから戻ってきた場合
        const elapsedInBackground = Date.now() - lastPauseTimeRef.current;
        setTime(prevTime => prevTime + Math.floor(elapsedInBackground / 1000));
        startTimeRef.current += elapsedInBackground; // 開始時刻も調整
        lastPauseTimeRef.current = 0;
      }

      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
      setIsResetButtonPressed(false); // タイマーがスタートしたらリセットボタンの状態を解除
    } else {
      clearInterval(timerRef.current);
      if (startTimeRef.current !== 0) { // タイマー停止時のみlastPauseTimeを更新
        lastPauseTimeRef.current = Date.now();
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // visibilitychangeイベントリスナーを追加
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) { // アプリがバックグラウンドに移行
        if (isRunning) {
          lastPauseTimeRef.current = Date.now();
        }
      } else { // アプリがフォアグラウンドに戻る
        if (isRunning && lastPauseTimeRef.current !== 0) {
          const elapsedInBackground = Date.now() - lastPauseTimeRef.current;
          setTime(prevTime => prevTime + Math.floor(elapsedInBackground / 1000));
          startTimeRef.current += elapsedInBackground; // 開始時刻も調整
          lastPauseTimeRef.current = 0;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    startTimeRef.current = 0; // 開始時刻をリセット
    lastPauseTimeRef.current = 0; // 一時停止時刻をリセット
    setIsResetButtonPressed(true); // リセットボタンが押されたら状態を保持
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
    return Math.floor(fee); // 小数点以下を切り捨て
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
        <h1>ご浄霊料金</h1>
        <div className="stopwatch">
          <div className="time-display">{formatTime(time)}</div>
          <div className="controls">
            <button onClick={handleStartStop} className={isRunning ? 'running' : ''}>
              {isRunning ? 'ストップ' : 'スタート'}
            </button>
            <button onClick={handleReset} className={isResetButtonPressed ? 'reset-pressed' : ''}>
              リセット
            </button>
          </div>
        </div>
        <div className="fee-display">
          <div className="fee-label">現在の料金</div>
          <div className="fee-amount">
            {calculateFee().toLocaleString()}
            <span className="fee-currency">円</span>
          </div>
        </div>
        <div className="rate-config">
          <p>現在の設定単価: {minuteRate.toLocaleString()}円/分</p>
          <button onClick={openModal}>単価を設定</button>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>分単価を設定</h2>
            <form onSubmit={handleRateSubmit}>
              <div className="modal-input-group">
                <input
                  type="number"
                  value={newRate}
                  onChange={handleRateChange}
                  min="1"
                  className="modal-input"
                />
                <span className="modal-unit">円</span>
              </div>
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
