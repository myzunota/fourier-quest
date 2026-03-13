// stages.js — Stage definitions for FOURIER QUEST Phase 1

export const STAGES = {

  /* ── TUTORIAL 1 ──────────────────────────────────────── */
  'tutorial-1': {
    id: 'tutorial-1',
    world: 'TUTORIAL',
    worldColor: '#8B5CF6',
    indexLabel: 'T-1',
    title: '振幅を制御せよ',
    subtitle: 'Amplitude Control',

    storyTitle: 'エントリー・ゲート',
    story: [
      '「ようこそ、シグナル・エンジニア。',
      'ここがハーモニック・ラティスへの入口だ。',
      '',
      'まず基礎から——波の高さを制御することを学べ。',
      '白い波が目標だ。緑の波をぴったり重ねてみせろ。」',
    ].join('\n'),

    // What the player must match
    targetComponents: [
      { amplitude: 0.70, frequency: 2, phase: 0 },
    ],

    // Each object = one wave component the player controls
    // fixed:true → slider hidden, value used directly
    playerInit: [
      {
        amplitude: { min: 0, max: 1.0, step: 0.01, value: 0.30, fixed: false, label: '振幅  A' },
        frequency:  { value: 2, fixed: true },
        phase:      { value: 0, fixed: true },
      },
    ],

    spectrumMaxBin: 8,

    thresholds: { s3: 0.02, s2: 0.08, s1: 0.25 },

    hint: [
      '【ヒント】',
      '振幅（A）は波の「高さ」を決めるパラメータ。',
      'スライダーを右に動かすと波が高くなる。',
      '目標値 A ≈ 0.70 を狙ってみよう。',
    ].join('\n'),

    successText: '「完璧だ。振幅の制御を習得した。ラティスの第一層が安定した。」',
    unlockNext: 'tutorial-2',
  },

  /* ── TUTORIAL 2 ──────────────────────────────────────── */
  'tutorial-2': {
    id: 'tutorial-2',
    world: 'TUTORIAL',
    worldColor: '#8B5CF6',
    indexLabel: 'T-2',
    title: '周波数を合わせよ',
    subtitle: 'Frequency Match',

    storyTitle: 'エントリー・ゲート',
    story: [
      '「次は周波数だ。',
      '周波数が高いほど波は速く細かく振動する——',
      '音楽で言えば「音の高さ」に相当する。',
      '',
      '右のパネルを見ろ。スペクトルが目標を示している。',
      '青い棒を白い棒の位置に合わせろ。」',
    ].join('\n'),

    targetComponents: [
      { amplitude: 0.65, frequency: 5, phase: 0 },
    ],

    playerInit: [
      {
        amplitude: { value: 0.65, fixed: true },
        frequency:  { min: 1, max: 8, step: 0.1, value: 2.0, fixed: false, label: '周波数  f (Hz)' },
        phase:      { value: 0, fixed: true },
      },
    ],

    spectrumMaxBin: 9,

    thresholds: { s3: 0.02, s2: 0.08, s1: 0.25 },

    hint: [
      '【ヒント】',
      '右のスペクトルグラフを見よう。',
      '白い棒 → 目標の周波数成分',
      '青い棒 → あなたの現在の周波数',
      '青を白に重ねるには f ≈ 5.0 を目指そう。',
    ].join('\n'),

    successText: '「周波数を掴んだ。これがフーリエ変換の核心——あらゆる波は周波数の集合だ。」',
    unlockNext: null,  // World 1 unlocks next
  },

};

/** Ordered list for the title/select screen */
export const TUTORIAL_ORDER = ['tutorial-1', 'tutorial-2'];

/**
 * All worlds for the stage-select screen.
 * Phase 1: only Tutorial is unlocked.
 */
export const WORLDS = [
  {
    id: 'tutorial',
    name: 'TUTORIAL',
    subtitle: 'エントリー・ゲート',
    color: '#8B5CF6',
    stages: TUTORIAL_ORDER,
    unlocked: true,
  },
  {
    id: 'world1',
    name: 'WORLD 1',
    subtitle: 'AMPLITUDE — 振動平原',
    color: '#00D4FF',
    stages: [],
    unlocked: false,
  },
  {
    id: 'world2',
    name: 'WORLD 2',
    subtitle: 'SYNTHESIS — 合成の塔',
    color: '#00FF88',
    stages: [],
    unlocked: false,
  },
  {
    id: 'world3',
    name: 'WORLD 3',
    subtitle: 'EPICYCLE — 軌道の庭',
    color: '#FF6B9D',
    stages: [],
    unlocked: false,
  },
  {
    id: 'world4',
    name: 'WORLD 4',
    subtitle: 'FILTER — ノイズの海',
    color: '#FFD700',
    stages: [],
    unlocked: false,
  },
];
