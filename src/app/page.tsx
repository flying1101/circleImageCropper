


// import CircleImageCropper from '@/components/circleImageCropper/index';
// import BlurImage from '@/components/blur/index';
// import { blurImage } from '@/lib/replicate'

import Link from "next/link";

export default async function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            图像处理工具
          </h1>
          <p className="text-lg text-gray-600">
            选择您需要的图像处理功能
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/blur" 
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                图像模糊
              </h3>
              <p className="text-gray-600 text-sm">
                智能模糊处理，让图像更加柔和
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link 
            href="/addtexttophoto" 
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                添加文字
              </h3>
              <p className="text-gray-600 text-sm">
                在图片上添加精美的文字效果
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link 
            href="/circleImageCropper" 
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                圆形裁剪
              </h3>
              <p className="text-gray-600 text-sm">
                将图片裁剪成完美的圆形
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </div>
    </div>
  );
}