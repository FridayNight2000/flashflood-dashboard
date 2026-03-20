'use client';

import StepCleanResult from '@/components/hydro/wizard/StepCleanResult';
import StepConfirm from '@/components/hydro/wizard/StepConfirm';
import StepDetrend from '@/components/hydro/wizard/StepDetrend';
import StepUpload from '@/components/hydro/wizard/StepUpload';
import { useWizardContext } from '@/lib/hydro/context';

export default function PrepPage() {
  const { state } = useWizardContext();

  return (
    <div className="container mx-auto flex px-4 py-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col">
        {/* 顶部进度条 */}
        <div className="pt-4 pb-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-800">Data Prep for Extraction</h1>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                state.currentStep <= 1
                  ? 'bg-blue-300'
                  : state.currentStep === 2
                    ? 'bg-blue-400'
                    : state.currentStep === 3
                      ? 'bg-blue-500'
                      : 'bg-blue-600'
              }`}
              style={{
                width: `${state.currentStep <= 1 ? 1 : ((state.currentStep - 1) / 3) * 100}%`,
              }}
            />
          </div>
        </div>
        {/* 步骤内容容器 */}
        <div className="py flex-1">
          {state.currentStep === 1 && <StepUpload />}
          {state.currentStep === 2 && <StepConfirm />}
          {state.currentStep === 3 && <StepCleanResult />}
          {state.currentStep === 4 && <StepDetrend />}
        </div>
      </div>
    </div>
  );
}
