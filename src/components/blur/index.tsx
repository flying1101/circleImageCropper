
"use client";

import React, { useRef, useState, useEffect } from "react";

const CANVAS_SIZE = 350;

const BLUR_EFFECTS = [
  { key: "gaussian", label: "Gaussian", img: "/gaussian.png" }, // 你可以用本地图片或SVG
  { key: "pixel", label: "Pixel", img: "/pixel.png" },
  { key: "noise", label: "Noise", img: "/noise.png" },
  { key: "motion", label: "Motion", img: "/motion.png" },
  { key: "radial", label: "Radial", img: "/radial.png" },
  { key: "color", label: "Color Blur", img: "/color.png" },
];

export default function BlurImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [blur, setBlur] = useState(5); // 默认模糊 5px
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [effect, setEffect] = useState("gaussian");

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
    // 这里只实现了高斯模糊，其他效果后续可扩展
    if (effect === "gaussian") {
      ctx.filter = `blur(${blur}px)`;
    } else {
      ctx.filter = "none";
      // 其他效果可在这里实现
    }
    // 居中绘制图片
    const scale = Math.min(CANVAS_SIZE / image.width, CANVAS_SIZE / image.height);
    const imgW = image.width * scale;
    const imgH = image.height * scale;
    const offsetX = (CANVAS_SIZE - imgW) / 2;
    const offsetY = (CANVAS_SIZE - imgH) / 2;
    ctx.drawImage(image, offsetX, offsetY, imgW, imgH);
    ctx.restore();
  }, [image, blur, effect]);

  // 下载模糊图片
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "blurred.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🎨 图片模糊工具
          </h1>
          <p className="text-white/80 text-lg">
            上传图片，实时调整模糊效果，一键下载
          </p>
        </div>

        <div className="bg-white/95 rounded-3xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* 左侧：上传和效果选择 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl cursor-pointer font-semibold shadow transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  上传图片
                </label>
                {image && (
                  <span className="text-gray-600 text-sm">已上传: {image.src.split('/').pop()}</span>
                )}
              </div>

              {/* 效果选项 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Image Blur Options</h3>
                <div className="grid grid-cols-3 gap-4">
                  {BLUR_EFFECTS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setEffect(opt.key)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition
                        ${effect === opt.key ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}
                        hover:border-indigo-400`}
                      type="button"
                    >
                      <img src={opt.img} alt={opt.label} className="w-16 h-16 object-cover rounded mb-2" />
                      <span className="text-base font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 模糊控制面板 */}
              {image && (
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    🎛️ 模糊控制
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-gray-700 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        无模糊
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        强模糊
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={0.1}
                      value={blur}
                      onChange={e => setBlur(Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 outline-none cursor-pointer appearance-none"
                      style={{
                        background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${(blur/20)*50}%, #facc15 ${(blur/20)*50}%, #facc15 ${(blur/20)*75}%, #f87171 ${(blur/20)*75}%, #f87171 100%)`
                      }}
                    />
                    
                    <div className="text-center">
                      <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
                        当前模糊值: <span className="font-bold">{blur}px</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg border-none rounded-xl py-4 px-6 cursor-pointer font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(102,126,234,0.6)] hover:from-indigo-600 hover:to-purple-700"
                  >
                    <span role="img" aria-label="download" className="text-xl">💾</span>
                    下载模糊图片
                  </button>
                </div>
              )}
            </div>

            {/* 右侧：预览区域 */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  预览效果
                </h2>
                
                {image ? (
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_SIZE}
                      height={CANVAS_SIZE}
                      className="block rounded-2xl bg-white shadow-[0_15px_35px_rgba(0,0,0,0.1)] border-2 border-white/30 mx-auto"
                      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                    />
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      实时预览
                    </div>
                  </div>
                ) : (
                  <div className="h-[350px] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <span role="img" aria-label="preview" className="text-6xl block mb-3">🖼️</span>
                      <div className="text-lg font-medium">等待上传图片</div>
                      <div className="text-sm">上传后将在此处显示模糊效果</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 使用提示 */}
              {image && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <span role="img" aria-label="tip" className="text-2xl">💡</span>
                    <div className="text-sm text-gray-700">
                      <div className="font-semibold mb-1">使用提示</div>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 拖动滑块调整模糊程度</li>
                        <li>• 支持 0-20px 的模糊范围</li>
                        <li>• 点击下载按钮保存图片</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
