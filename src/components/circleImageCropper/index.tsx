"use client";

import React, { useRef, useState, useEffect } from "react";

const CROP_SIZE = 400; // 裁剪框直径
const CIRCLE_RADIUS = 150; // 圆形裁剪区域半径（比原来小）

export default function CircleImageCropper() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 上传图片
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
  };

  // 拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - start.x,
      y: e.clientY - start.y,
    });
  };
  const handleMouseUp = () => setDragging(false);

  // 绘制canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    // 1. 画暗的图片
    const imgW = image.width * scale;
    const imgH = image.height * scale;
    const offsetX = position.x + (CROP_SIZE - imgW) / 2;
    const offsetY = position.y + (CROP_SIZE - imgH) / 2;
    ctx.drawImage(image, offsetX, offsetY, imgW, imgH);

    // 2. 圆外加暗色遮罩 - 增强暗色效果
    ctx.save();
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fill();
    ctx.globalCompositeOperation = "destination-over";
    // 使用更深的暗色遮罩
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.restore();

    // 3. 圆内重画亮的图片
    ctx.save();
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, offsetX, offsetY, imgW, imgH);
    ctx.restore();
  }, [image, scale, position]);

  // 裁剪并下载
  const handleCrop = () => {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = CIRCLE_RADIUS * 2;
    canvas.height = CIRCLE_RADIUS * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.beginPath();
    ctx.arc(CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    // 计算图片在裁剪框中的位置（修正）
    const imgW = image.width * scale;
    const imgH = image.height * scale;
    const offsetX = position.x + (CROP_SIZE - imgW) / 2;
    const offsetY = position.y + (CROP_SIZE - imgH) / 2;
    // 修正：将大画布中心的内容平移到小画布中心
    const cropOffsetX = offsetX - (CROP_SIZE / 2 - CIRCLE_RADIUS);
    const cropOffsetY = offsetY - (CROP_SIZE / 2 - CIRCLE_RADIUS);
    ctx.drawImage(image, cropOffsetX, cropOffsetY, imgW, imgH);
    ctx.restore();
    // 下载
    const link = document.createElement("a");
    link.download = "cropped.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🎨 圆形图片裁剪器
          </h1>
          <p className="text-white/80 text-lg">
            上传图片，拖拽调整位置，轻松裁剪出完美圆形头像
          </p>
        </div>

        {/* 主要内容区域 - 左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 左侧：上传和控制区域 */}
          <div className="space-y-6">
            {/* 上传区域 */}
            <div className="bg-white/95 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📤</span>
                上传图片
              </h2>
              
              <label className="block border-2 border-dashed border-indigo-400 rounded-xl py-8 text-center text-lg cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 text-gray-700 font-medium hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(102,126,234,0.3)] hover:border-indigo-500">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span role="img" aria-label="upload" className="text-5xl block mb-3">📷</span>
                <div className="text-lg font-semibold mb-2">点击上传图片</div>
                <div className="text-sm text-gray-500">支持 JPG、PNG、GIF 格式</div>
              </label>
            </div>

            {/* 控制面板 */}
            {image && (
              <div className="bg-white/95 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">⚙️</span>
                  调整控制
                </h2>
                
                {/* 缩放控制 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700 font-medium">图片缩放</span>
                    <span className="text-indigo-600 font-semibold">{Math.round(scale * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-500 text-sm">缩小</span>
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.01}
                      value={scale}
                      onChange={e => setScale(Number(e.target.value))}
                      className="flex-1 h-2 rounded bg-gradient-to-r from-indigo-400 to-purple-600 outline-none cursor-pointer"
                    />
                    <span className="text-gray-500 text-sm">放大</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-3">
                  <button
                    onClick={handleCrop}
                    className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg border-none rounded-xl py-4 px-6 cursor-pointer font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(102,126,234,0.6)]"
                  >
                    <span role="img" aria-label="download" className="text-xl">💾</span>
                    裁剪并下载
                  </button>
                  
                  <button
                    onClick={() => {
                      setScale(1);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className="w-full bg-gradient-to-br from-gray-500 to-gray-600 text-white text-lg border-none rounded-xl py-3 px-6 cursor-pointer font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span role="img" aria-label="reset" className="text-xl">🔄</span>
                    重置位置
                  </button>
                </div>

                {/* 提示信息 */}
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 text-lg">💡</span>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium mb-1">使用提示：</div>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 拖拽图片调整位置</li>
                        <li>• 使用滑块缩放图片</li>
                        <li>• 圆形区域内的内容将被保留</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：预览区域 */}
          <div className="bg-white/95 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">👁️</span>
              预览效果
            </h2>
            
            {image ? (
              <div className="flex justify-center">
                <div className="relative" style={{ width: CROP_SIZE, height: CROP_SIZE }}>
                  <canvas
                    ref={canvasRef}
                    width={CROP_SIZE}
                    height={CROP_SIZE}
                    className={`block rounded-2xl ${dragging ? "cursor-grabbing" : "cursor-grab"} bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-white/20 transition-transform duration-200 hover:scale-[1.02]`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ width: CROP_SIZE, height: CROP_SIZE }}
                  />
                  {/* 圆形边框 */}
                  <div
                    className="absolute pointer-events-none box-border"
                    style={{
                      left: CROP_SIZE / 2 - CIRCLE_RADIUS,
                      top: CROP_SIZE / 2 - CIRCLE_RADIUS,
                      width: CIRCLE_RADIUS * 2,
                      height: CIRCLE_RADIUS * 2,
                      borderRadius: "50%",
                      border: "3px solid #fff",
                      boxShadow: "0 0 0 2px #667eea, 0 4px 12px rgba(102, 126, 234, 0.3)",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <span className="text-6xl mb-4">🖼️</span>
                <div className="text-lg font-medium mb-2">暂无图片</div>
                <div className="text-sm">请先上传图片开始裁剪</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
