import React from 'react';

export default function IntroPage() {
  return (
    <div className="ml-auto mr-6 max-w-5xl space-y-6">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Introduction</h1>

      {/* Section 1: Background & Motivation */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          研究背景与动机{' '}
          <span className="text-xl font-normal text-slate-400">(Background & Motivation)</span>
        </h2>
        <p className="text-lg leading-7 text-slate-600">
          山洪（Flash Flood）作为洪水的极端变种，其最显著的特征是水位极速上升（通常在 6
          小时以内达到峰值）且具有远超常规洪水的破坏强度。鉴于日本特有的地形与水文特征，该地区极易频发山洪事件。然而，尽管现有的预警系统能够应对常规洪水，但针对"山洪"这种突发性灾害的专属预警在日本目前仍属于空白。为了推动未来相关的防灾研究与预测工作，构建一个详实、可靠的全日本历史山洪事件数据库是不可或缺的基石。
        </p>
      </section>

      {/* Section 2: Project Scope & Objectives */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          项目定位与目标{' '}
          <span className="text-xl font-normal text-slate-400">(Project Scope & Objectives)</span>
        </h2>
        <p className="text-lg leading-7 text-slate-600">
          本文档聚焦于全日本山洪事件数据库的自动化数据提取流水线（Data Extraction
          Pipeline）。为了克服传统方法（如 Excel
          手工处理）在面对海量水文数据时效率低下的瓶颈，本项目开发了一套基于 Python
          的核心处理库。该流水线负责执行从原始数据清洗、事件边界判定到复杂水文特征提取的全流程计算，旨在产出高置信度的结构化山洪数据库，并最终为一个支持数据库查询和下载的
          UI 项目提供核心数据支撑。
        </p>
      </section>

      {/* Section 3: Scale & Feasibility */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          研究规模与数据可行性{' '}
          <span className="text-xl font-normal text-slate-400">(Scale & Feasibility)</span>
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-1 font-semibold text-slate-800">数据深度与广度</h3>
            <p className="text-lg leading-7 text-slate-600">
              日本拥有分布广泛且记录完整的水文站点网络。本研究排除了数据缺失严重的站点，锁定了 1922
              个在 2002 年至 2023 年间具备稳定有效水位数据及官方对比记录的目标站点。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-1 font-semibold text-slate-800">海量样本积累</h3>
            <p className="text-lg leading-7 text-slate-600">
              限定单一区域会导致有效事件样本过少。立足于全国范围的 1922
              个目标站点，本流水线成功提取了海量的山洪事件样本，这为未来各种水文分析和大规模计算需求提供了充足的数据储备。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
