<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>C.A.E.R. – Centro de Acompañamiento Estudiantil Rosarino</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
  :root {
    --verde: #1a5c2a;
    --verde-oscuro: #0f3a1a;
    --verde-claro: #2a7a3a;
    --dorado: #d4a017;
    --dorado-claro: #f0c040;
    --dorado-suave: #fdf3d0;
    --blanco: #ffffff;
    --gris: #f5f5f0;
    --texto: #1a1a1a;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; color: var(--texto); background: var(--blanco); overflow-x: hidden; }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(15, 58, 26, 0.97);
    backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.8rem 3rem;
    border-bottom: 2px solid var(--dorado);
  }
  .nav-logo { display: flex; align-items: center; gap: 0.7rem; }
  .nav-logo-circle {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--dorado);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-weight: 900; font-size: 0.85rem; color: var(--verde-oscuro);
    letter-spacing: 0.5px;
  }
  .nav-logo-text { color: var(--blanco); font-weight: 600; font-size: 0.95rem; line-height: 1.2; }
  .nav-logo-text span { display: block; color: var(--dorado-claro); font-size: 0.75rem; font-weight: 400; }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links a { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--dorado-claro); }
  .nav-cta {
    background: var(--dorado); color: var(--verde-oscuro);
    padding: 0.55rem 1.4rem; border-radius: 4px;
    font-weight: 700; text-decoration: none; font-size: 0.9rem;
    transition: background 0.2s, transform 0.2s;
  }
  .nav-cta:hover { background: var(--dorado-claro); transform: translateY(-1px); }

  /* HERO */
  .hero {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--verde-oscuro) 0%, var(--verde) 60%, #1e6b2e 100%);
    display: flex; align-items: center;
    position: relative; overflow: hidden;
    padding: 7rem 3rem 4rem;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .hero-content { position: relative; z-index: 2; max-width: 650px; }
  .hero-badge {
    display: inline-block;
    background: rgba(212, 160, 23, 0.15);
    border: 1px solid var(--dorado);
    color: var(--dorado-claro);
    padding: 0.4rem 1rem; border-radius: 20px;
    font-size: 0.8rem; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: 1.5rem;
    animation: fadeUp 0.6s ease both;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    color: var(--blanco); line-height: 1.1; margin-bottom: 1.2rem;
    animation: fadeUp 0.6s 0.1s ease both;
  }
  .hero h1 em { color: var(--dorado-claro); font-style: normal; }
  .hero p {
    color: rgba(255,255,255,0.82); font-size: 1.15rem; line-height: 1.7;
    margin-bottom: 2rem; font-weight: 300;
    animation: fadeUp 0.6s 0.2s ease both;
  }
  .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; animation: fadeUp 0.6s 0.3s ease both; }
  .btn-primary {
    background: var(--dorado); color: var(--verde-oscuro);
    padding: 0.9rem 2rem; border-radius: 5px;
    font-weight: 700; font-size: 1rem; text-decoration: none;
    transition: all 0.2s; box-shadow: 0 4px 20px rgba(212,160,23,0.4);
  }
  .btn-primary:hover { background: var(--dorado-claro); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212,160,23,0.5); }
  .btn-secondary {
    background: transparent; color: var(--blanco);
    padding: 0.9rem 2rem; border-radius: 5px;
    font-weight: 600; font-size: 1rem; text-decoration: none;
    border: 2px solid rgba(255,255,255,0.4);
    transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--blanco); background: rgba(255,255,255,0.08); }

  .hero-visual {
    position: absolute; right: 4rem; top: 50%; transform: translateY(-50%);
    width: 340px; animation: floatIn 1s 0.4s ease both;
  }
  .hero-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(212,160,23,0.3);
    backdrop-filter: blur(10px);
    border-radius: 16px; padding: 2rem;
    color: var(--blanco);
  }
  .hero-card-icon { font-size: 2.5rem; margin-bottom: 1rem; }
  .hero-card h3 { font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 0.5rem; }
  .hero-card p { font-size: 0.9rem; color: rgba(255,255,255,0.7); line-height: 1.6; }
  .hero-card-tag {
    display: inline-block; margin-top: 1rem;
    background: var(--dorado); color: var(--verde-oscuro);
    padding: 0.25rem 0.8rem; border-radius: 20px;
    font-size: 0.75rem; font-weight: 700;
  }
  .hero-card2 { margin-top: 1rem; }

  /* STATS BAR */
  .stats-bar {
    background: var(--dorado);
    padding: 1.5rem 3rem;
    display: flex; justify-content: center; gap: 4rem; flex-wrap: wrap;
  }
  .stat-item { text-align: center; }
  .stat-item .num {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 900; color: var(--verde-oscuro); display: block;
  }
  .stat-item .lbl { font-size: 0.8rem; font-weight: 600; color: var(--verde-oscuro); opacity: 0.75; text-transform: uppercase; letter-spacing: 1px; }

  /* SERVICIOS */
  .section { padding: 5rem 3rem; }
  .section-label {
    text-align: center; text-transform: uppercase;
    letter-spacing: 2px; font-size: 0.8rem; font-weight: 600;
    color: var(--dorado); margin-bottom: 0.5rem;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    text-align: center; color: var(--verde-oscuro);
    margin-bottom: 1rem; line-height: 1.2;
  }
  .section-sub { text-align: center; color: #555; max-width: 560px; margin: 0 auto 3.5rem; line-height: 1.7; }

  .servicios-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 900px; margin: 0 auto; }
  .servicio-card {
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 4px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }
  .servicio-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
  .servicio-header {
    background: var(--verde);
    padding: 2.5rem 2rem 2rem;
    color: var(--blanco); position: relative;
  }
  .servicio-header.grabada { background: var(--verde-oscuro); }
  .servicio-icon { font-size: 3rem; margin-bottom: 1rem; }
  .servicio-badge {
    position: absolute; top: 1rem; right: 1rem;
    background: var(--dorado); color: var(--verde-oscuro);
    font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.7rem;
    border-radius: 20px; text-transform: uppercase;
  }
  .servicio-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; margin-bottom: 0.5rem;
  }
  .servicio-header p { font-size: 0.9rem; color: rgba(255,255,255,0.8); line-height: 1.6; }
  .servicio-body { background: var(--blanco); padding: 1.5rem 2rem; }
  .servicio-features { list-style: none; }
  .servicio-features li {
    padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem; color: #444; display: flex; align-items: center; gap: 0.6rem;
  }
  .servicio-features li:last-child { border-bottom: none; }
  .servicio-features li::before { content: '✓'; color: var(--verde); font-weight: 700; }
  .servicio-cta {
    display: block; text-align: center; margin-top: 1.2rem;
    background: var(--verde); color: var(--blanco);
    padding: 0.75rem; border-radius: 6px;
    font-weight: 600; font-size: 0.9rem; text-decoration: none;
    transition: background 0.2s;
  }
  .servicio-cta:hover { background: var(--verde-claro); }

  /* PRÓXIMAMENTE */
  .pronto-section { background: var(--gris); padding: 4rem 3rem; text-align: center; }
  .pronto-box {
    max-width: 600px; margin: 2rem auto 0;
    border: 2px dashed var(--dorado);
    border-radius: 12px; padding: 2.5rem;
    background: var(--dorado-suave);
  }
  .pronto-box .icon { font-size: 3rem; margin-bottom: 1rem; }
  .pronto-box h3 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--verde-oscuro); margin-bottom: 0.7rem; }
  .pronto-box p { color: #555; line-height: 1.7; font-size: 0.95rem; }
  .pronto-tags { display: flex; gap: 0.7rem; flex-wrap: wrap; justify-content: center; margin-top: 1.2rem; }
  .pronto-tag {
    background: var(--verde); color: var(--blanco);
    padding: 0.35rem 1rem; border-radius: 20px;
    font-size: 0.8rem; font-weight: 600;
  }

  /* REDES */
  .redes-section { background: var(--verde-oscuro); padding: 4rem 3rem; }
  .redes-grid { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-top: 2.5rem; }
  .red-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(212,160,23,0.3);
    border-radius: 12px; padding: 1.8rem 2.5rem;
    text-align: center; text-decoration: none;
    transition: all 0.25s; min-width: 160px;
    color: var(--blanco);
  }
  .red-card:hover { background: rgba(212,160,23,0.15); border-color: var(--dorado); transform: translateY(-4px); }
  .red-card .red-icon { font-size: 2.5rem; margin-bottom: 0.7rem; display: block; }
  .red-card span { font-size: 0.9rem; font-weight: 600; display: block; }
  .red-card small { color: rgba(255,255,255,0.6); font-size: 0.78rem; }

  /* CONTACTO */
  .contacto-section { padding: 5rem 3rem; max-width: 700px; margin: 0 auto; text-align: center; }
  .contacto-form { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; text-align: left; }
  .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--verde-oscuro); }
  .form-group input, .form-group select, .form-group textarea {
    border: 2px solid #e0e0e0; border-radius: 6px;
    padding: 0.75rem 1rem; font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; transition: border-color 0.2s; outline: none;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    border-color: var(--verde);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .btn-submit {
    background: var(--verde); color: var(--blanco);
    border: none; border-radius: 6px;
    padding: 1rem 2rem; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 15px rgba(26,92,42,0.3);
  }
  .btn-submit:hover { background: var(--verde-claro); transform: translateY(-2px); }

  /* FOOTER */
  footer {
    background: #060f09; color: rgba(255,255,255,0.6);
    padding: 2rem 3rem; text-align: center; font-size: 0.85rem;
    border-top: 2px solid var(--dorado);
  }
  footer strong { color: var(--dorado-claro); }

  /* ANIMATIONS */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes floatIn { from { opacity: 0; transform: translateY(-50%) translateX(40px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }

  /* MOBILE */
  @media (max-width: 900px) {
    .hero-visual { display: none; }
    nav { padding: 0.8rem 1.5rem; }
    .nav-links { display: none; }
    .hero { padding: 7rem 1.5rem 4rem; }
    .section { padding: 4rem 1.5rem; }
    .stats-bar { gap: 2rem; padding: 1.5rem 1rem; }
    .form-row { grid-template-columns: 1fr; }
    .redes-section { padding: 4rem 1.5rem; }
    .pronto-section { padding: 4rem 1.5rem; }
    .contacto-section { padding: 4rem 1.5rem; }
    footer { padding: 2rem 1.5rem; }
  }
</style>
</head>
<body>

<!-- NAVEGACIÓN -->
<nav>
  <div class="nav-logo">
    <div class="nav-logo-circle">CAER</div>
    <div class="nav-logo-text">
      C.A.E.R.
      <span>Acompañamiento Estudiantil</span>
    </div>
  </div>
  <ul class="nav-links">
    <li><a href="#servicios">Clases</a></li>
    <li><a href="#proximamente">Próximamente</a></li>
    <li><a href="#redes">Redes</a></li>
    <li><a href="#contacto">Contacto</a></li>
  </ul>
  <a href="#contacto" class="nav-cta">¡Quiero inscribirme!</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-badge">📍 Rosario, Santa Fe</div>
    <h1>Tu <em>éxito académico</em> empieza aquí</h1>
    <p>Centro de Acompañamiento Estudiantil Rosarino. Clases virtuales grabadas y en vivo para que estudies a tu ritmo, con la guía que necesitás.</p>
    <div class="hero-btns">
      <a href="#servicios" class="btn-primary">Ver nuestras clases</a>
      <a href="#contacto" class="btn-secondary">Contactarnos</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="hero-card">
      <div class="hero-card-icon">🎥</div>
      <h3>Clases Grabadas</h3>
      <p>Accedé a todo el contenido cuando quieras, las veces que quieras.</p>
      <div class="hero-card-tag">DISPONIBLE AHORA</div>
    </div>
    <div class="hero-card hero-card2">
      <div class="hero-card-icon">🔴</div>
      <h3>Clases en Vivo</h3>
      <p>Sesiones virtuales interactivas con docentes en tiempo real.</p>
      <div class="hero-card-tag">EN VIVO</div>
    </div>
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stat-item">
    <span class="num">2</span>
    <span class="lbl">Modalidades de clase</span>
  </div>
  <div class="stat-item">
    <span class="num">100%</span>
    <span class="lbl">Virtual y flexible</span>
  </div>
  <div class="stat-item">
    <span class="num">Rosario</span>
    <span class="lbl">Con cobertura nacional</span>
  </div>
  <div class="stat-item">
    <span class="num">24/7</span>
    <span class="lbl">Acceso al material</span>
  </div>
</div>

<!-- SERVICIOS -->
<section class="section" id="servicios">
  <p class="section-label">Lo que ofrecemos</p>
  <h2 class="section-title">Dos formas de aprender,<br/>un solo objetivo</h2>
  <p class="section-sub">Elegí la modalidad que mejor se adapte a tu ritmo y necesidades. Ambas están diseñadas para acompañarte durante todo tu proceso educativo.</p>

  <div class="servicios-grid">
    <!-- GRABADAS -->
    <div class="servicio-card">
      <div class="servicio-header grabada">
        <div class="servicio-badge">Flexible</div>
        <div class="servicio-icon">🎥</div>
        <h3>Clases Grabadas</h3>
        <p>Estudiá a tu propio ritmo. Accedé al contenido cuando quieras, pausá, retrocedé y repasá todas las veces que necesites.</p>
      </div>
      <div class="servicio-body">
        <ul class="servicio-features">
          <li>Acceso ilimitado al material</li>
          <li>Podés ver en cualquier dispositivo</li>
          <li>Repasá antes de los exámenes</li>
          <li>Contenido actualizado regularmente</li>
          <li>Sin horarios fijos</li>
        </ul>
        <a href="#contacto" class="servicio-cta">Quiero acceder</a>
      </div>
    </div>

    <!-- EN VIVO -->
    <div class="servicio-card">
      <div class="servicio-header">
        <div class="servicio-badge">🔴 En Vivo</div>
        <div class="servicio-icon">💻</div>
        <h3>Clases Virtuales en Directo</h3>
        <p>Participá en tiempo real, hacé preguntas, interactuá con docentes y compañeros en un aula virtual dinámica.</p>
      </div>
      <div class="servicio-body">
        <ul class="servicio-features">
          <li>Interacción directa con el docente</li>
          <li>Resolución de dudas al instante</li>
          <li>Clases con grupos reducidos</li>
          <li>Quedan grabadas para repasar</li>
          <li>Calendarios flexibles</li>
        </ul>
        <a href="#contacto" class="servicio-cta">Quiero anotarme</a>
      </div>
    </div>
  </div>
</section>

<!-- PRÓXIMAMENTE -->
<section class="pronto-section" id="proximamente">
  <p class="section-label">Muy pronto</p>
  <h2 class="section-title">Más formación en camino</h2>
  <div class="pronto-box">
    <div class="icon">🚀</div>
    <h3>Cursos y Capacitaciones</h3>
    <p>Estamos preparando programas de formación más completos para que puedas desarrollar nuevas habilidades y potenciar tu carrera académica y profesional.</p>
    <div class="pronto-tags">
      <span class="pronto-tag">Cursos especializados</span>
      <span class="pronto-tag">Capacitaciones</span>
      <span class="pronto-tag">Certificaciones</span>
    </div>
  </div>
</section>

<!-- REDES SOCIALES -->
<section class="redes-section" id="redes">
  <p class="section-label" style="color: var(--dorado-claro);">Seguinos en</p>
  <h2 class="section-title" style="color: var(--blanco);">Nuestras Redes</h2>
  <div class="redes-grid">
    <a href="#" class="red-card">
      <span class="red-icon">📸</span>
      <span>Instagram</span>
      <small>@caer.rosario</small>
    </a>
    <a href="#" class="red-card">
      <span class="red-icon">📘</span>
      <span>Facebook</span>
      <small>C.A.E.R. Oficial</small>
    </a>
    <a href="#" class="red-card">
      <span class="red-icon">▶️</span>
      <span>YouTube</span>
      <small>Clases y contenido</small>
    </a>
  </div>
</section>

<!-- CONTACTO -->
<section class="contacto-section" id="contacto">
  <p class="section-label">Escribinos</p>
  <h2 class="section-title">¿Querés inscribirte?</h2>
  <p class="section-sub">Dejanos tus datos y nos ponemos en contacto para contarte todo sobre nuestras clases.</p>
  <form class="contacto-form" onsubmit="handleSubmit(event)">
    <div class="form-row">
      <div class="form-group">
        <label>Nombre completo</label>
        <input type="text" placeholder="Tu nombre y apellido" required/>
      </div>
      <div class="form-group">
        <label>WhatsApp / Teléfono</label>
        <input type="tel" placeholder="+54 341 ..." required/>
      </div>
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" placeholder="tu@email.com" required/>
    </div>
    <div class="form-group">
      <label>¿Qué modalidad te interesa?</label>
      <select required>
        <option value="">Seleccioná una opción...</option>
        <option>Clases Grabadas</option>
        <option>Clases en Vivo (virtual)</option>
        <option>Ambas modalidades</option>
        <option>Quiero más información primero</option>
      </select>
    </div>
    <div class="form-group">
      <label>Mensaje (opcional)</label>
      <textarea rows="3" placeholder="¿Alguna consulta específica?"></textarea>
    </div>
    <button type="submit" class="btn-submit">Enviar consulta →</button>
  </form>
</section>

<!-- FOOTER -->
<footer>
  <p><strong>C.A.E.R.</strong> – Centro de Acompañamiento Estudiantil Rosarino</p>
  <p style="margin-top:0.4rem;">Rosario, Santa Fe, Argentina &nbsp;|&nbsp; Todos los derechos reservados &nbsp;|&nbsp; 2025</p>
</footer>

<script>
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
  btn.textContent = '¡Mensaje enviado! ✓';
  btn.style.background = '#2a7a3a';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Enviar consulta →';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
}
</script>

</body>
</html>
