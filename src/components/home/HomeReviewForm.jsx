import TextField from '../forms/TextField.jsx';
import TextareaField from '../forms/TextareaField.jsx';
import PhotoField from '../forms/PhotoField.jsx';
import FormAlert from '../forms/FormAlert.jsx';
import Honeypot from '../forms/Honeypot.jsx';
import Button from '../common/Button.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import { useForm } from '../../hooks/useForm.js';
import { required, minLength, maxLength } from '../../utils/validation.js';

const schema = {
  name: required('Enter your name.'),
  body: [required('Tell us about your move.'), minLength(20), maxLength(2000)],
};

/**
 * The review database isn't reachable from this deployment yet, so submissions
 * fail with an honest, specific message rather than silently pretending to save.
 */
function submitHomeReview() {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error('Database connection is down. Please contact the administrator.')), 650);
  });
}

export default function HomeReviewForm() {
  const form = useForm({ initialValues: { name: '', photo: null, body: '', _gotcha: '' }, schema });

  return (
    <section className="section tint" id="write-review" aria-labelledby="home-review-title">
      <div className="wrap narrow">
        <SectionHeader
          id="home-review-title" kicker="Moved with us?" title="Share your experience"
          text="Add your name, a photo and a few words about your move — your review helps other families and businesses plan theirs."
        />
        <form className="card card-pad" onSubmit={form.handleSubmit(submitHomeReview)} noValidate>
          <div className="form-grid cols-2">
            <TextField label="Your name" autoComplete="name" maxLength={100} {...form.field('name')} />
            <PhotoField hint="A face helps other visitors trust your review." onChange={(file) => form.setValue('photo', file)} />
          </div>
          <TextareaField
            className="mt-1" label="Your review" rows={5} maxLength={2000}
            hint="Between 20 and 2,000 characters."
            placeholder="Tell others about your move — what went well, and what could be better."
            {...form.field('body')}
          />
          <Honeypot {...form.field('_gotcha')} />
          <FormAlert error={form.formError} />
          <div className="form-actions">
            <Button type="submit" loading={form.submitting}>Submit review</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
