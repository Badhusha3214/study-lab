import React from 'react';

export default function TailwindDebug() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-700 underline decoration-wavy">Tailwind Debug Panel</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
          <p className="font-semibold mb-2">Color / spacing utilities</p>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-brand-100 rounded" />
            <div className="w-12 h-12 bg-brand-300 rounded" />
            <div className="w-12 h-12 bg-brand-500 rounded" />
            <div className="w-12 h-12 bg-brand-700 rounded" />
          </div>
          <div className="mt-3 p-2 bg-white rounded border text-sm">Class test: <code className="text-pink-600">bg-brand-500</code></div>
        </div>
        <div className="p-4 bg-gradient-to-br from-brand-50 to-indigo-100 rounded-lg border border-indigo-200 animate-fadeUp">
          <p className="font-semibold mb-2">Gradient + animation</p>
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 rounded-lg animate-float" />
        </div>
        <div className="p-4 col-span-2 bg-white rounded-lg border border-gray-200">
          <p className="font-semibold mb-2">Typography & utility stacking</p>
          <p className="text-gray-700 leading-relaxed">If Tailwind is working, this paragraph should have controlled line height, color, and margin from utility classes. Otherwise it will look like default browser styles.</p>
        </div>
      </div>
      <div className="mt-8 p-4 rounded-lg border-2 border-dashed border-red-400">
        <p className="text-sm">If none of the colors or spacing appear, Tailwind isn\'t processing. Check PostCSS, restart dev server, and ensure <code>index.css</code> is imported in <code>index.js</code>.</p>
      </div>
    </div>
  );
}
