const select = document.getElementById('league-select');
const body   = document.getElementById('fixtures-body');
const status = document.getElementById('fixtures-status');
const KEYS   = ['3', '123', '1'];   


const FALLBACK = {
  4328: [['Arsenal','Chelsea'],['Liverpool','Man City'],['Spurs','Everton']],
  4335: [['Real Madrid','Barcelona'],['Sevilla','Valencia'],['Villarreal','Betis']],
  4332: [['Juventus','Inter'],['AC Milan','Roma'],['Napoli','Lazio']],
  4331: [['Bayern','Dortmund'],['Leipzig','Leverkusen'],['Frankfurt','Stuttgart']],
  4334: [['PSG','Marseille'],['Lyon','Monaco'],['Lille','Nice']],
  4480: [['Real Madrid','Bayern'],['Man City','PSG'],['Barcelona','Inter']]
};

function addCell(row, label, text) {
  const td = document.createElement('td');
  td.dataset.label = label;
  td.textContent = text;
  row.appendChild(td);
}

function addRow(date, home, away, time) {
  const row = document.createElement('tr');
  addCell(row, 'Date', date);
  addCell(row, 'Home', home);
  addCell(row, 'Away', away);
  addCell(row, 'Time', time);
  body.appendChild(row);
}


function currentSeason() {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

async function fetchJson(key, endpoint) {
  const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${key}/${endpoint}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}


function cleanUp(events) {
  const cutoff = Date.now() - 3 * 60 * 60 * 1000;
  const seen = new Set();
  const toDate = ev => new Date(`${ev.dateEvent}T${ev.strTime || '00:00:00'}Z`);
  return events
    .filter(ev => {
      if (!ev.dateEvent || seen.has(ev.idEvent)) return false;
      seen.add(ev.idEvent);
      return toDate(ev) >= cutoff;
    })
    .sort((a, b) => toDate(a) - toDate(b));
}

async function getEvents(id) {
  let lastError;
  for (const key of KEYS) {
    try {

      const next = await fetchJson(key, `eventsnextleague.php?id=${id}`);
      let events = next.events || [];
      if (events.length === 0) return [];


      const season = events[0].strSeason || currentSeason();
      const round  = parseInt(events[0].intRound, 10);

      if (!isNaN(round)) {
        for (let r = round; r <= round + 2 && cleanUp(events).length < 3; r++) {
          try {
            const data = await fetchJson(key, `eventsround.php?id=${id}&r=${r}&s=${season}`);
            events = events.concat(data.events || []);
          } catch (e) { console.warn('Round ' + r + ' lookup failed', e); }
        }
      }
      return cleanUp(events);
    } catch (e) { lastError = e; }
  }
  throw lastError;
}

select.addEventListener('change', async () => {
  body.innerHTML = '';
  if (!select.value) {
    status.textContent = 'Select a league to see its next 3 fixtures.';
    return;
  }
  status.textContent = 'Loading fixtures...';

  try {
    const events = await getEvents(select.value);
    if (events.length === 0) {
      status.textContent = 'No upcoming fixtures found for this league right now.';
      return;
    }
    events.slice(0, 3).forEach(ev => {
      const when = new Date(`${ev.dateEvent}T${ev.strTime || '00:00:00'}Z`);
      addRow(
        when.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }),
        ev.strHomeTeam, ev.strAwayTeam,
        ev.strTime ? when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBC'
      );
    });
    status.textContent = '';
  } catch (err) {
    console.error(err);
    status.textContent = 'Live data unavailable (' + err.message + '). Showing sample fixtures.';
    (FALLBACK[select.value] || []).forEach(m => addRow('TBC', m[0], m[1], 'TBC'));
  }
});


const teamLeague  = document.getElementById('team-league-select');
const teamSelect  = document.getElementById('team-select');
const squadStatus = document.getElementById('squad-status');
const squadGrid   = document.getElementById('squad-grid');
const dialog      = document.getElementById('player-dialog');
const dialogBody  = document.getElementById('player-dialog-body');


async function getJson(endpoint) {
  let lastError;
  for (const key of KEYS) {
    try { return await fetchJson(key, endpoint); } catch (e) { lastError = e; }
  }
  throw lastError;
}


const LEAGUE_NAMES = {
  4328: 'English Premier League',
  4335: 'Spanish La Liga',
  4332: 'Italian Serie A',
  4331: 'German Bundesliga',
  4334: 'French Ligue 1'
};


async function getTeams(leagueId) {
  const season = currentSeason();
  const teams = new Map();                       

  for (const r of [1, 2, 3]) {
    if (teams.size >= 16) break;                 
    try {
      const data = await getJson(`eventsround.php?id=${leagueId}&r=${r}&s=${season}`);
      (data.events || []).forEach(ev => {
        if (ev.idHomeTeam) teams.set(ev.idHomeTeam, ev.strHomeTeam);
        if (ev.idAwayTeam) teams.set(ev.idAwayTeam, ev.strAwayTeam);
      });
    } catch (e) { console.warn('Round ' + r + ' failed', e); }
  }

  if (teams.size > 0) {
    return [...teams].map(([idTeam, strTeam]) => ({ idTeam, strTeam }));
  }

  
  const data = await getJson(`search_all_teams.php?l=${encodeURIComponent(LEAGUE_NAMES[leagueId])}`);
  return data.teams || [];
}

teamLeague.addEventListener('change', async () => {
  squadGrid.innerHTML = '';
  teamSelect.innerHTML = '<option value="">-- Select a team --</option>';
  teamSelect.disabled = true;
  if (!teamLeague.value) {
    squadStatus.textContent = 'Choose a league, then a team, to see its squad.';
    return;
  }
  squadStatus.textContent = 'Loading teams...';
  try {
    const teams = (await getTeams(teamLeague.value))
      .sort((a, b) => a.strTeam.localeCompare(b.strTeam));
    if (teams.length === 0) { squadStatus.textContent = 'No teams found for this league.'; return; }
    teams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.idTeam;
      opt.textContent = t.strTeam;
      teamSelect.appendChild(opt);
    });
    teamSelect.disabled = false;
    squadStatus.textContent = `${teams.length} teams loaded. Now choose a team.`;
  } catch (err) {
    console.error(err);
    squadStatus.textContent = 'Could not load teams (' + err.message + ').';
  }
});


teamSelect.addEventListener('change', async () => {
  squadGrid.innerHTML = '';
  if (!teamSelect.value) { squadStatus.textContent = 'Now choose a team.'; return; }
  squadStatus.textContent = 'Loading squad...';
  try {
    const data  = await getJson(`lookup_all_players.php?id=${teamSelect.value}`);
    const squad = data.player || [];
    if (squad.length === 0) { squadStatus.textContent = 'No squad data available for this team.'; return; }
    const rank = p => {
      const pos = (p.strPosition || '').toLowerCase();
      if (pos.includes('goal'))    return 0;
      if (pos.includes('defen'))   return 1;
      if (pos.includes('mid'))     return 2;
      if (pos.includes('forw') || pos.includes('attack') || pos.includes('wing') || pos.includes('strik')) return 3;
      return 4;                                   
    };
    squad.sort((a, b) => rank(a) - rank(b) || a.strPlayer.localeCompare(b.strPlayer))
         .forEach(p => squadGrid.appendChild(playerCard(p)));
    squadStatus.textContent = `${squad.length} players. Click one for details.`;
    squadStatus.textContent = 'Click a player to see their details.';
  } catch (err) {
    console.error(err);
    squadStatus.textContent = 'Could not load squad (' + err.message + ').';
  }
});

function playerCard(p) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'squad-card';

  const pic = p.strCutout || p.strThumb;
  if (pic) {
    const img = document.createElement('img');
    img.src = pic;
    img.alt = p.strPlayer;
    img.loading = 'lazy';
    btn.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'squad-ph';
    ph.textContent = p.strNumber || p.strPlayer.charAt(0);
    btn.appendChild(ph);
  }

  const name = document.createElement('strong');
  name.textContent = p.strPlayer;
  const pos = document.createElement('span');
  pos.textContent = p.strPosition || '';
  btn.append(name, pos);

  btn.addEventListener('click', () => showPlayer(p));
  return btn;
}


function showPlayer(p) {
  dialogBody.innerHTML = '';

  const pic = p.strCutout || p.strThumb;
  if (pic) {
    const img = document.createElement('img');
    img.src = pic;
    img.alt = p.strPlayer;
    img.className = 'dialog-photo';
    dialogBody.appendChild(img);
  }

  const h = document.createElement('h3');
  h.textContent = p.strPlayer;
  dialogBody.appendChild(h);

  const dl = document.createElement('dl');
  [
    ['Number', p.strNumber],
    ['Position', p.strPosition],
    ['Nationality', p.strNationality],
    ['Born', [p.dateBorn, p.strBirthLocation].filter(Boolean).join(' · ')],
    ['Height', p.strHeight],
    ['Weight', p.strWeight],
    ['Team', p.strTeam]
  ].forEach(([label, value]) => {
    if (!value) return;
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    dl.append(dt, dd);
  });
  dialogBody.appendChild(dl);

  if (p.strDescriptionEN) {
    const bio = document.createElement('p');
    bio.className = 'dialog-bio';
    bio.textContent = p.strDescriptionEN;
    dialogBody.appendChild(bio);
  }
  dialog.showModal();
}

document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }); // click outside to close