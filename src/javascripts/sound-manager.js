import {Howler, Howl} from 'howler';
import Map from 'es6-map';
import $ from 'zepto-modules';
import {rand, cap} from './util/helpers';
import {MODE} from './constants';

/* eslint-disable */

// generated by https://github.com/tonistiigi/audiosprite
const spriteConfig = {
  "urls": [
    "/audio/output.ogg",
    "/audio/output.m4a",
    "/audio/output.mp3",
    "/audio/output.ac3"
  ],
  "sprite": {
    "button": [
      0,
      1008.9795918367348
    ],
    "joined": [
      3000,
      1019.8412698412698
    ],
    "lose": [
      6000,
      1202.698412698412
    ],
    "miss": [
      9000,
      500
    ],
    "net": [
      11000,
      500
    ],
    "point": [
      13000,
      792.0181405895689
    ],
    "racket01": [
      15000,
      504.9659863945575
    ],
    "racket02": [
      17000,
      504.96598639455925
    ],
    "racket03": [
      19000,
      504.96598639455925
    ],
    "table01": [
      21000,
      523.5147392290252
    ],
    "table02": [
      23000,
      523.5147392290252
    ],
    "table03": [
      25000,
      523.5147392290252
    ],
    "touch": [
      27000,
      523.5147392290252
    ],
    "transition": [
      29000,
      1019.8412698412689
    ],
    "type": [
      32000,
      27.188208616777843
    ],
    "win": [
      34000,
      1202.6984126984103
    ]
  }
};

export default class SoundManager {
  constructor(config) {
    this.config = config;
    this.muted = false;
    this.error = true;
    this.uiSprite = new Howl({
      src: spriteConfig.urls,
      sprite: spriteConfig.sprite,
      onload: () => {
        console.log('loaded');
        this.error = false;
      },
    });
    const url = '/audio/loops/';
    this.loopSounds = new Map();
    this.loopSounds.set('bass', new Howl({
      loop: true,
      src: [
        `${url}loop1-bass.mp3`,
        `${url}loop1-bass.ogg`,
      ],
      onload: () => {
        this.loopSounds.get('bass').play();
      },
    }));
    this.loopSounds.set('bass-pad', new Howl({loop: true, src: [
      `${url}loop1-bass-pad.mp3`,
      `${url}loop1-bass-pad.ogg`,
    ]}));
    this.loopSounds.set('bass-pad-synth', new Howl({loop: true, src: [
      `${url}loop1-bass-pad-synth.mp3`,
      `${url}loop1-bass-pad-synth.ogg`,
    ]}));
    this.loopSounds.set('waiting', new Howl({loop: true, src: [
      `${url}waiting.mp3`,
      `${url}waiting.ogg`,
    ]}));
    if (localStorage.muted === 'true') {
      this.mute();
    }
  }

  playLoop(keyLoop) {
    if (this.error) return;
    let pos = 0;
    let done = false;
    this.loopSounds.forEach((sound, key) => {
      if (done) {
        return;
      }
      if (this.loopSounds.get(key).playing()) {
        if (keyLoop === key) {
          // sound already playing
          done = true;
          return;
        }
        pos = this.loopSounds.get(key).seek();
        this.loopSounds.get(key).fade(1, 0, 1500);
        this.loopSounds.get(key).once('fade', () => {
          this.loopSounds.get(key).stop();
        });
      }
    });
    if (done) {
      return;
    }
    this.loopSounds.get(keyLoop).seek(pos);
    this.loopSounds.get(keyLoop).fade(0, 1, 1500);
    this.loopSounds.get(keyLoop).play();
  }

  playUI(id) {
    if (this.error) return;
    this.uiSprite.play(id);
  }

  paddle(point = {x: 0, y: 0, z: 0}) {
    if (this.error) return;
    const id = `racket0${rand(1, 4)}`;
    //this.uiSprite.pos(point.x, point.y, point.z);
    this.uiSprite.play(id);
  }

  table(point = {x: 0, y: 0, z: 0}, velocity = {x: 0, y: -1, z: -1}) {
    if (this.error) return;
    if (point.y > this.config.tableHeight + 0.1 && this.config.mode === MODE.MULTIPLAYER) {
      // ball hit vertical table but its not visible
      return;
    }
    const id = `table0${rand(1, 4)}`;
    this.uiSprite.pos(point.x, point.y, point.z);
    if (point.y > this.config.tableHeight + 0.1) {
      // ball hit vertical table half, use z velocity as volume
      this.uiSprite.volume(cap(velocity.z * -0.5, 0, 1));
    } else {
      // ball hit horizontal table, use y velocity as volume
      this.uiSprite.volume(cap(velocity.y * -0.5, 0, 1));
    }
    this.uiSprite.play(id);
  }

  toggleMute() {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // eslint-disable-next-line
  blur() {
    Howler.mute(true);
  }

  focus() {
    if (!this.muted) {
      Howler.mute(false);
    }
  }

  mute() {
    $('.mute img').attr('src', 'images/icon-mute.svg');
    localStorage.muted = 'true';
    Howler.mute(true);
    this.muted = true;
  }

  unmute() {
    $('.mute img').attr('src', 'images/icon-unmute.svg');
    localStorage.muted = 'false';
    Howler.mute(false);
    this.muted = false;
  }
}
