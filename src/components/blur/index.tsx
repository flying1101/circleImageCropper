// src/components/blur/index.tsx

"use client";

import React, { useRef, useState, useEffect } from "react";

const CANVAS_SIZE = 400;

export default function BlurImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [blur, setBlur] = useState(5); // 默认模糊 5px
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 上传图片
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
  };

  // 绘制模糊图片
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    // 居中绘制图片
    const scale = Math.min(CANVAS_SIZE / image.width, CANVAS_SIZE / image.height);
    const imgW = image.width * scale;
    const imgH = image.height * scale;
    const offsetX = (CANVAS_SIZE - imgW) / 2;
    const offsetY = (CANVAS_SIZE - imgH) / 2;
    ctx.drawImage(image, offsetX, offsetY, imgW, imgH);
    ctx.restore();
  }, [image, blur]);

  // 下载模糊图片
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "blurred.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-[480px] mx-auto mt-10 font-sans bg-gradient-to-br from-indigo-400 to-purple-600 min-h-screen p-5">
      <div className="bg-white/95 rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur">
        <label className="block border-2 border-dashed border-indigo-400 rounded-xl py-10 text-center text-xl mb-8 cursor-pointer bg-gradient-to-br from-gray-100 to-gray-300 transition-all duration-300 text-gray-700 font-medium hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(102,126,234,0.3)]">
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
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="block rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-white/20 mx-auto"
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            />
            {/* 模糊控制 */}
            <div className="my-6 px-5">
              <div className="flex items-center justify-between mb-2 text-gray-700 text-sm">
                <span>无模糊</span>
                <span>强模糊</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={0.1}
                value={blur}
                onChange={e => setBlur(Number(e.target.value))}
                className="w-full h-1.5 rounded bg-gradient-to-r from-indigo-400 to-purple-600 outline-none cursor-pointer"
              />
              <div className="text-gray-500 text-xs mt-2">当前模糊值: {blur}px</div>
            </div>
            <button
              onClick={handleDownload}
              className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white text-lg border-none rounded-xl py-4 px-8 w-full my-4 cursor-pointer font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.6)]"
            >
              <span role="img" aria-label="download" className="text-xl">💾</span>
              下载模糊图片
            </button>
            <div className="text-gray-500 text-sm mt-4 p-3 bg-indigo-400/10 rounded border border-indigo-400/20">
              ✨ 图片已加载，可通过滑块调整模糊程度
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
