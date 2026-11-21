import { sound } from '../audio/sound';
import { TEXT } from '../config/text';
import { byId } from './dom';

/** The 🔊 / 🎵 buttons in the corner, plus the M key for music. */
export function bindSoundControls(): void {
  const effectsBtn = byId('sfxBtn');
  const musicBtn = byId('musicBtn');

  const refresh = (): void => {
    effectsBtn.textContent = sound.effectsOn ? TEXT.effectsOn : TEXT.effectsOff;
    musicBtn.textContent = sound.musicOn ? TEXT.musicOn : TEXT.musicOff;
    effectsBtn.classList.toggle('off', !sound.effectsOn);
    musicBtn.classList.toggle('off', !sound.musicOn);
    effectsBtn.setAttribute('aria-pressed', String(sound.effectsOn));
    musicBtn.setAttribute('aria-pressed', String(sound.musicOn));
  };

  effectsBtn.addEventListener('click', () => {
    sound.setEffects(!sound.effectsOn);
    sound.play('click');
  });
  musicBtn.addEventListener('click', () => sound.setMusic(!sound.musicOn));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') sound.setMusic(!sound.musicOn);
  });

  sound.onChange(refresh);
  refresh();
}
