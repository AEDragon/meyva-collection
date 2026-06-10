/* global React, useLang, t */

// Annonces (« Quoi de neuf ? ») et événements gérés depuis le dashboard.
// Les deux sections disparaissent d'elles-mêmes quand rien n'est publié.
// index.html est la version exécutée ; ce fichier est un miroir source.

function NewsCard({ post }) {
  const lang = useLang();
  return (
    <article className="news-card">
      {post.image && <div className="news-img"><img src={post.image} alt={post.title} loading="lazy" /></div>}
      <div className="news-body">
        {post.date && <div className="news-date">{post.date}</div>}
        <h3 className="news-title">{post.title}</h3>
        {post.text && <p className="news-text">{post.text}</p>}
        {post.link && <a className="link-btn" href={post.link} target="_blank" rel="noopener">{(post.linkLabel || t(lang, 'ev_more')) + ' →'}</a>}
      </div>
    </article>
  );
}

function NewsSection() {
  const lang = useLang();
  const items = ((window.MEYVA_DATA && window.MEYVA_DATA.POSTS) || []).filter(p => p.published !== false);
  if (!items.length) return null;
  return (
    <section className="section news">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">{t(lang, 'news_eyebrow')}</div>
          <h2 className="section-title">{t(lang, 'news_t1')}<em>{t(lang, 'news_em')}</em>{t(lang, 'news_t2')}</h2>
        </div>
      </div>
      <div className="news-grid">{items.map(p => <NewsCard key={p.id} post={p} />)}</div>
    </section>
  );
}

function EventCard({ ev }) {
  const lang = useLang();
  return (
    <article className="event-card">
      {ev.image && <div className="event-img"><img src={ev.image} alt={ev.title} loading="lazy" /></div>}
      <div className="event-body">
        {ev.date && <div className="event-date">{ev.date}</div>}
        <h3 className="event-title">{ev.title}</h3>
        {ev.place && <div className="event-place">📍 {ev.place}</div>}
        {ev.text && <p className="event-text">{ev.text}</p>}
        {ev.link && <a className="btn btn-outline event-cta" href={ev.link} target="_blank" rel="noopener">{ev.linkLabel || t(lang, 'ev_more')}</a>}
      </div>
    </article>
  );
}

function EventsSection() {
  const lang = useLang();
  const items = ((window.MEYVA_DATA && window.MEYVA_DATA.EVENTS) || []).filter(e => e.published !== false);
  if (!items.length) return null;
  return (
    <section className="section events">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">{t(lang, 'ev_eyebrow')}</div>
          <h2 className="section-title">{t(lang, 'ev_t1')}<em>{t(lang, 'ev_em')}</em>{t(lang, 'ev_t2')}</h2>
        </div>
      </div>
      <div className="event-grid">{items.map(e => <EventCard key={e.id} ev={e} />)}</div>
    </section>
  );
}

Object.assign(window, { NewsSection, EventsSection, NewsCard, EventCard });
