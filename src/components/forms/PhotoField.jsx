import { useRef, useState } from 'react';
import Icon from '../common/Icon.jsx';

/**
 * Optional photo picker with a circular preview. Keeps the chosen File in
 * form state (via onChange) for the caller to use — nothing is uploaded here.
 */
export default function PhotoField({ label = 'Your photo', hint, onChange, optional = true }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const pick = (file) => {
    if (!file) return;
    onChange?.(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clear = () => {
    onChange?.(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="field photo-field">
      <label>{label}{optional && <span className="optional"> (optional)</span>}</label>
      <div className="photo-picker">
        <button
          type="button"
          className="photo-preview"
          onClick={() => inputRef.current?.click()}
          aria-label={preview ? 'Change your photo' : 'Add a photo'}
        >
          {preview ? <img src={preview} alt="" /> : <Icon name="user" />}
        </button>
        <div className="photo-picker-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()}>
            <Icon name="upload" /><span>{preview ? 'Change photo' : 'Add a photo'}</span>
          </button>
          {preview && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>Remove</button>
          )}
        </div>
        <input
          ref={inputRef} type="file" accept="image/*" hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
