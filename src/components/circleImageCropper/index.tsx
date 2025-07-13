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
    <div className="max-w-[480px] mx-auto mt-10 font-sans bg-gradient-to-br from-indigo-400 to-purple-600 min-h-screen p-5">
      <div className="bg-white/95 rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur">
        <label
          className="block border-2 border-dashed border-indigo-400 rounded-xl py-10 text-center text-xl mb-8 cursor-pointer bg-gradient-to-br from-gray-100 to-gray-300 transition-all duration-300 text-gray-700 font-medium hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(102,126,234,0.3)]"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <span role="img" aria-label="upload" className="text-4xl mr-3 block mb-2">📷</span>
          点击上传图片
        </label>

        {image && (
          <div className="text-center">
            <div className="relative mx-auto" style={{ width: CROP_SIZE, height: CROP_SIZE }}>
              <canvas
                ref={canvasRef}
                width={CROP_SIZE}
                height={CROP_SIZE}
                className={`block rounded-2xl ${dragging ? "cursor-grabbing" : "cursor-grab"} bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-white/20`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ width: CROP_SIZE, height: CROP_SIZE }}
              />
              {/* 圆形边框 - 更美观的设计 */}
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
            
            {/* 缩放控制 */}
            <div className="my-6 px-5">
              <div className="flex items-center justify-between mb-2 text-gray-700 text-sm">
                <span>缩小</span>
                <span>放大</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.01}
                value={scale}
                onChange={e => setScale(Number(e.target.value))}
                className="w-full h-1.5 rounded bg-gradient-to-r from-indigo-400 to-purple-600 outline-none cursor-pointer"
              />
            </div>
            
            <div>
              <button
                onClick={handleCrop}
                className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white text-lg border-none rounded-xl py-4 px-8 w-full my-4 cursor-pointer font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.6)]"
              >
                <span role="img" aria-label="download" className="text-xl">💾</span>
                裁剪并下载
              </button>
            </div>
            <div className="text-gray-500 text-sm mt-4 p-3 bg-indigo-400/10 rounded border border-indigo-400/20">
              ✨ 图片已加载，可拖动调整位置，使用滑块缩放图片
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
