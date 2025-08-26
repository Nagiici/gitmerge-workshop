'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/personas')
      .then(res => res.json())
      .then(data => {
        setPersonas(data.personas || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('获取人格数据失败:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">测试页面 - 人格数据</h1>
      
      {personas.length === 0 ? (
        <div className="text-red-600">
          未获取到人格数据，请检查数据库连接和初始化。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personas.map((persona: any) => (
            <div key={persona.id} className="border p-4 rounded-lg">
              <div className="text-2xl mb-2">{persona.avatar}</div>
              <h3 className="font-semibold">{persona.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{persona.description}</p>
              <div className="text-xs text-gray-500">
                ID: {persona.id}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">API测试</h2>
        <button
          onClick={() => {
            fetch('/api/personas')
              .then(res => res.json())
              .then(data => console.log('人格数据:', data))
              .catch(error => console.error('请求失败:', error));
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          测试人格API
        </button>
      </div>
    </div>
  );
}