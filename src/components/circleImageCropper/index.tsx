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
    <div style={{ 
      maxWidth: 480, 
      margin: "40px auto", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        padding: "32px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)"
      }}>
        <label
          style={{
            display: "block",
            border: "2px dashed #667eea",
            borderRadius: 16,
            padding: "40px 0",
            textAlign: "center",
            fontSize: 20,
            marginBottom: 32,
            cursor: "pointer",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            transition: "all 0.3s ease",
            color: "#4a5568",
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <span role="img" aria-label="upload" style={{ fontSize: 36, marginRight: 12, display: "block", marginBottom: 8 }}>📷</span>
          点击上传图片
        </label>

        {image && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                margin: "0 auto",
                borderRadius: 20,
                background: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                position: "relative",
                userSelect: "none",
                border: "1px solid rgba(255,255,255,0.2)"
              }}
            >
              <canvas
                ref={canvasRef}
                width={CROP_SIZE}
                height={CROP_SIZE}
                style={{
                  width: CROP_SIZE,
                  height: CROP_SIZE,
                  display: "block",
                  borderRadius: 20,
                  cursor: dragging ? "grabbing" : "grab",
                  background: "#fff",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              {/* 圆形边框 - 更美观的设计 */}
              <div
                style={{
                  position: "absolute",
                  left: CROP_SIZE / 2 - CIRCLE_RADIUS,
                  top: CROP_SIZE / 2 - CIRCLE_RADIUS,
                  width: CIRCLE_RADIUS * 2,
                  height: CIRCLE_RADIUS * 2,
                  borderRadius: "50%",
                  border: "3px solid #fff",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  boxShadow: "0 0 0 2px #667eea, 0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              />
            </div>
            
            {/* 缩放控制 */}
            <div style={{ margin: "24px 0", padding: "0 20px" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: 8,
                color: "#4a5568",
                fontSize: 14
              }}>
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
                style={{ 
                  width: "100%", 
                  height: 6,
                  borderRadius: 3,
                  background: "linear-gradient(to right, #667eea, #764ba2)",
                  outline: "none",
                  cursor: "pointer"
                }}
              />
            </div>
            
            <div>
              <button
                onClick={handleCrop}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  fontSize: 18,
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 32px",
                  width: "100%",
                  margin: "16px 0",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                }}
              >
                <span role="img" aria-label="download" style={{ fontSize: 20 }}>💾</span>
                裁剪并下载
              </button>
            </div>
            <div style={{ 
              color: "#718096", 
              fontSize: 14, 
              marginTop: 16,
              padding: "12px",
              background: "rgba(102, 126, 234, 0.1)",
              borderRadius: 8,
              border: "1px solid rgba(102, 126, 234, 0.2)"
            }}>
              ✨ 图片已加载，可拖动调整位置，使用滑块缩放图片
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
