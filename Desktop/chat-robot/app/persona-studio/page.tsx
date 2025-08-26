'use client';

import { Suspense } from 'react';
import PersonaStudioLayout from '@/components/persona-studio/PersonaStudioLayout';

function PersonaStudioContent() {
  return <PersonaStudioLayout />;
}

export default function PersonaStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载人格工作室...</div>
      </div>
    }>
      <PersonaStudioContent />
    </Suspense>
  );
}