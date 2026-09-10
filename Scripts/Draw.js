/* SmartClubDraws - Draw.js
 * ASP.NET MVC 5 / Bootstrap 4 port of the React app.
 * All draw logic, animations, and localStorage handling live here.
 */
(function ($) {
    'use strict';

    // ── Constants ─────────────────────────────────────────────────────────────

    var DEFAULT_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    var PLACEHOLDER_EVENTS = [
        {
            id: 'evt-001', name: 'Summer Gala Draw 2025',
            entries: me([
                ['Conor Walsh', 'M1001'], ['Aoife Murphy', 'M1002'], ["Seán O'Brien", 'M1003'],
                ['Ciara Kelly', 'M1004'], ['Liam Brennan', 'M1005'], ['Niamh Doyle', 'M1006'],
                ['Eoin Ryan', 'M1007'], ['Siobhán Clarke', 'M1008'], ['Pádraig Flynn', 'M1009'],
                ['Róisín McCarthy', 'M1010'], ['Darragh Nolan', 'M1011'], ['Fiona Byrne', 'M1012'],
                ['Shane Power', 'M1013'], ['Aisling Moore', 'M1014'], ['Ciarán Hughes', 'M1015'],
                ["Gráinne O'Neill", 'M1016'], ['Declan Quinn', 'M1017'], ['Orla Farrell', 'M1018'],
                ['Brian Kavanagh', 'M1019'], ['Sinéad Dunne', 'M1020']
            ])
        },
        {
            id: 'evt-002', name: 'Christmas Fundraiser 2025',
            entries: me([
                ['Michael Daly', 'T2001'], ['Patricia Lynch', 'T2002'], ['Kevin Moran', 'T2003'],
                ['Amanda Fitzgerald', 'T2004'], ['Robert Burke', 'T2005'], ['Helen Gallagher', 'T2006'],
                ['James Connolly', 'T2007'], ['Mary Sheridan', 'T2008'], ['Patrick Hennessy', 'T2009'],
                ['Anne Delaney', 'T2010'], ['Thomas Casey', 'T2011'], ['Catherine Regan', 'T2012'],
                ['William Foley', 'T2013'], ['Margaret Higgins', 'T2014'], ["Peter O'Sullivan", 'T2015'],
                ['Elizabeth Mullen', 'T2016'], ['Stephen Phelan', 'T2017'], ['Kathleen Doherty', 'T2018'],
                ['Daniel Tobin', 'T2019'], ['Josephine Wall', 'T2020'], ['Anthony Kehoe', 'T2021'],
                ['Frances Cullen', 'T2022'], ['Gerard McGrath', 'T2023'], ['Brigid Sinnott', 'T2024']
            ])
        },
        {
            id: 'evt-003', name: 'Annual Golf Club Draw',
            entries: me([
                ['Harry Jenkins', 'G3001'], ["Rachel O'Connor", 'G3002'], ['Tom Byrne', 'G3003'],
                ['Laura Kearney', 'G3004'], ['Mark Whelan', 'G3005'], ['Sandra Murray', 'G3006'],
                ['Ian Carroll', 'G3007'], ['Denise Lawlor', 'G3008'], ['Francis Ryan', 'G3009'],
                ['Barbara Lennon', 'G3010'], ['Vincent Smyth', 'G3011'], ['Pauline Brennan', 'G3012']
            ])
        },
        {
            id: 'evt-004', name: 'GAA Club Lotto Draw',
            entries: me([
                ['Séamus Brady', 'L4001'], ['Emer Flood', 'L4002'], ['Cathal Donoghue', 'L4003'],
                ['Máire Ní Bhriain', 'L4004'], ['Tadhg Ó Ceallaigh', 'L4005'], ['Bríd Ní Catháin', 'L4006'],
                ['Pádraig Mac Cormaic', 'L4007'], ['Eimear Ní Fhaoláin', 'L4008'], ['Cillian Ó Briain', 'L4009'],
                ['Sorcha Ní Mhurchú', 'L4010'], ['Ruairí Mac Giolla', 'L4011'], ['Nóra Ní Dhubhghaill', 'L4012'],
                ['Tomás Ó Meadhra', 'L4013'], ['Clïodhna Ní Shúileabháin', 'L4014'], ['Fearghal Mac Síomóin', 'L4015'],
                ['Deirdre Ní Loinsigh', 'L4016']
            ])
        },
        {
            id: 'evt-005', name: 'Soccer Club End of Season Draw',
            entries: me([
                ['Aaron Fitzpatrick', 'S5001'], ['Claire Nolan', 'S5002'], ["Dean O'Reilly", 'S5003'],
                ['Emma Barry', 'S5004'], ['Finn Hughes', 'S5005'], ['Grace Power', 'S5006'],
                ['Henry Walsh', 'S5007'], ['Isla Murray', 'S5008'], ['Jack Ryan', 'S5009'],
                ['Katie Flynn', 'S5010'], ['Luke Byrne', 'S5011'], ["Mia O'Brien", 'S5012'],
                ['Nathan Moore', 'S5013'], ['Olivia Kelly', 'S5014'], ['Paul Brennan', 'S5015'],
                ['Quinn Doyle', 'S5016'], ['Ryan McCarthy', 'S5017'], ['Sophie Clarke', 'S5018']
            ])
        }
    ];

    function me(data) {
        return data.map(function (d) { return { name: d[0], id: d[1] }; });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function ordinal(n) {
        var s = ['th', 'st', 'nd', 'rd'];
        var v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function pickWinners(entries, count) {
        var pool = entries.slice();
        var winners = [];
        while (winners.length < count && pool.length > 0) {
            var idx = Math.floor(Math.random() * pool.length);
            winners.push(pool.splice(idx, 1)[0]);
        }
        return winners;
    }

    function hexToRgbParts(hex) {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
        return parseInt(h.slice(0,2),16) + ',' + parseInt(h.slice(2,4),16) + ',' + parseInt(h.slice(4,6),16);
    }

    function rgba(hex, a) {
        return 'rgba(' + hexToRgbParts(hex) + ',' + a + ')';
    }

    function loadSettings() {
        var base = { clubName: '', eventName: '', logoUrl: '', accentColor: '#06b6d4', winnerCount: 3 };
        try {
            var saved = JSON.parse(localStorage.getItem('scs_settings') || '{}');
            var logo  = localStorage.getItem('scs_logo') || '';
            return $.extend({}, base, saved, { logoUrl: logo });
        } catch (e) { return base; }
    }

    function saveSettings(s) {
        localStorage.setItem('scs_settings', JSON.stringify($.extend({}, s, { logoUrl: '' })));
        if (s.logoUrl) localStorage.setItem('scs_logo', s.logoUrl);
    }

    function loadPresets() {
        try { return JSON.parse(localStorage.getItem('scs_presets') || '[]'); }
        catch (e) { return []; }
    }

    function savePresets(p) { localStorage.setItem('scs_presets', JSON.stringify(p)); }

    function fireConfetti(color) {
        var fire = function (r, opts) {
            confetti($.extend({ origin: { y: 0.6 }, colors: [color, '#ffffff', '#3b82f6'], particleCount: Math.floor(200 * r) }, opts));
        };
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2,  { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1,  { spread: 120, startVelocity: 45 });
    }

    // ── State ─────────────────────────────────────────────────────────────────

    var S = {
        settings:       loadSettings(),
        entries:        [],
        drawnWinners:   [],
        currentWinner:  null,
        isAnimating:    false,
        autoMode:       false,
        isFullscreen:   false,
        selectedEventId: null,
        savedPresets:   loadPresets(),
        allWinners:     [],
        animTimer:      null,
        introTimer:     null,
        autoTimer:      null,
        revealTimer:    null,
        pendingAnimation: null,
        screen:         'setup'
    };

    // ── Logo ──────────────────────────────────────────────────────────────────

    function buildLogoEl(size) {
        if (S.settings.logoUrl) {
            return $('<img>').addClass('logo-img')
                .attr('src', S.settings.logoUrl).attr('alt', 'Club logo')
                .css({ width: size, height: size });
        }
        var initials = S.settings.clubName ? S.settings.clubName.slice(0, 2).toUpperCase() : 'SC';
        return $('<div>').addClass('logo-placeholder-inner').text(initials).css({
            width:  size + 'px', height: size + 'px',
            fontSize: (size * 0.28) + 'px',
            color: S.settings.accentColor,
            background: rgba(S.settings.accentColor, 0.13),
            border: '2px solid ' + rgba(S.settings.accentColor, 0.2)
        });
    }

    function refreshLogos() {
        var map = {
            'setup-header-logo': 80,
            'setup-logo-small':  48,
            'intro-logo-inner':  160,
            'drawing-logo-inner':110,
            'results-logo-inner':120
        };
        $.each(map, function (id, size) {
            $('#' + id).empty().append(buildLogoEl(size));
        });
    }

    // ── Accent Color ──────────────────────────────────────────────────────────

    function applyAccent(color) {
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--accent-rgb', hexToRgbParts(color));
        refreshLogos();
        renderEventList();
        renderDrawModeBtns();
        renderSwatches();
        updateStartBtn();
        updateSavePresetBtn();
        $('#inp-color-picker').val(color);
        $('#accent-color-hex').text(color);
    }

    // ── Setup Screen ──────────────────────────────────────────────────────────

    function renderEventList() {
        var $list = $('#event-list').empty();
        PLACEHOLDER_EVENTS.forEach(function (ev) {
            var sel = S.selectedEventId === ev.id;
            var $btn = $('<button>').addClass('event-btn').attr('data-evid', ev.id);
            var $info = $('<div>');
            $info.append($('<div>').addClass('font-weight-bold').css('font-size', '0.875rem').text(ev.name));
            $info.append($('<div>').addClass('text-muted').css('font-size', '0.75rem').css('margin-top', '2px').text(ev.entries.length + ' entries'));
            $btn.append($info);
            if (sel) {
                $btn.append($('<div>').addClass('event-check-badge').css('background', S.settings.accentColor).html('&#10003;'));
                $btn.css({ background: rgba(S.settings.accentColor, 0.06), borderColor: rgba(S.settings.accentColor, 0.33), color: '#0f172a' });
            }
            $list.append($btn);
        });
    }

    function renderDrawModeBtns() {
        var accent = S.settings.accentColor;
        $('#draw-mode-group .draw-mode-btn').each(function () {
            var isAuto = $(this).data('mode') === 'auto';
            var active = S.autoMode === isAuto;
            $(this).css(active
                ? { background: rgba(accent, 0.13), borderColor: rgba(accent, 0.4), color: accent }
                : { background: 'white', borderColor: '#e2e8f0', color: '#64748b' }
            );
        });
    }

    function renderSwatches() {
        var accent = S.settings.accentColor;

        var $def = $('#default-swatches').empty();
        DEFAULT_COLORS.forEach(function (c) {
            var $s = $('<button>').addClass('color-swatch').css({
                background: c,
                outline: accent === c ? '3px solid ' + c : 'none',
                'outline-offset': '3px'
            }).data('color', c).on('click', function () {
                S.settings.accentColor = c;
                saveSettings(S.settings);
                applyAccent(c);
            });
            $def.append($s);
        });

        var $pre = $('#saved-presets').empty();
        S.savedPresets.forEach(function (c) {
            var $wrap = $('<div>').addClass('preset-wrapper');
            var $s = $('<button>').addClass('color-swatch').css({
                background: c,
                outline: accent === c ? '3px solid ' + c : 'none',
                'outline-offset': '3px'
            }).data('color', c).on('click', function () {
                S.settings.accentColor = c;
                saveSettings(S.settings);
                applyAccent(c);
            });
            var $rm = $('<button>').addClass('preset-remove').html('&#x2715;').on('click', function (e) {
                e.stopPropagation();
                S.savedPresets = S.savedPresets.filter(function (x) { return x !== c; });
                savePresets(S.savedPresets);
                renderSwatches();
                updateSavePresetBtn();
            });
            $pre.append($wrap.append($s).append($rm));
        });
    }

    function updateSavePresetBtn() {
        var c = S.settings.accentColor;
        var disabled = DEFAULT_COLORS.indexOf(c) >= 0 || S.savedPresets.indexOf(c) >= 0;
        var $btn = $('#btn-save-preset');
        $btn.prop('disabled', disabled);
        $btn.css(disabled
            ? { borderColor: '#e2e8f0', color: '#94a3b8', background: 'white' }
            : { borderColor: c, color: c, background: rgba(c, 0.06) }
        );
    }

    function updateStartBtn() {
        var accent = S.settings.accentColor;
        var canStart = S.entries.length >= S.settings.winnerCount && S.settings.winnerCount >= 1;
        var label = S.entries.length === 0
            ? 'Select an event to begin'
            : !canStart ? 'Need at least ' + S.settings.winnerCount + ' entries'
            : 'Start Draw';
        var $btn = $('#btn-start-draw').text(label);
        if (canStart) {
            $btn.prop('disabled', false).css({
                background: 'linear-gradient(135deg, ' + accent + ', ' + rgba(accent, 0.73) + ')',
                color: 'white',
                'box-shadow': '0 4px 24px ' + rgba(accent, 0.27),
                border: 'none'
            });
        } else {
            $btn.prop('disabled', true).css({
                background: '#f1f5f9', color: '#94a3b8',
                border: '1px solid #e2e8f0', 'box-shadow': 'none'
            });
        }
    }

    function initSetupScreen() {
        $('#inp-club-name').val(S.settings.clubName);
        $('#inp-winner-count').val(S.settings.winnerCount);
        $('#inp-color-picker').val(S.settings.accentColor);
        $('#accent-color-hex').text(S.settings.accentColor);
        renderEventList();
        renderDrawModeBtns();
        renderSwatches();
        updateStartBtn();
        updateSavePresetBtn();
        refreshLogos();
        if (S.settings.logoUrl) $('#logo-upload-zone').text('Click to change logo');
    }

    // ── Screen Management ─────────────────────────────────────────────────────

    function showScreen(name) {
        var $old = $('.scs-screen:visible');
        var $new = $('#screen-' + name);
        S.screen = name;
        if ($old.length && $old[0] !== $new[0]) {
            $old.fadeOut(220, function () {
                $new.fadeIn(300);
                onScreenReady(name);
            });
        } else {
            $new.fadeIn(300);
            onScreenReady(name);
        }
    }

    function onScreenReady(name) {
        if (name === 'setup')   { initSetupScreen(); }
        if (name === 'intro')   { startIntroScreen(); }
        if (name === 'drawing') {
            renderDrawingScreen();
            if (S.pendingAnimation) {
                var pending = S.pendingAnimation;
                S.pendingAnimation = null;
                runAnimation(pending.winner, pending.pool);
            }
        }
        if (name === 'results') { renderResultsScreen(); }
        updateTopbars();
    }

    function updateTopbars() {
        var label = S.settings.eventName || S.settings.clubName || '';
        $('#intro-topbar-label, #drawing-topbar-label').text(label);
        var fsText = S.isFullscreen ? '⛶ Exit' : '⛶ Fullscreen';
        $('.btn-fullscreen-toggle').text(fsText);
    }

    // ── Intro Screen ──────────────────────────────────────────────────────────

    function startIntroScreen() {
        refreshLogos();
        $('#intro-club-name').text(S.settings.clubName || '').toggle(!!S.settings.clubName);
        $('#intro-event-name').text(S.settings.eventName || 'Draw');
        $('#intro-title-phase').show();
        $('#intro-countdown').hide();

        clearTimeout(S.introTimer);
        S.introTimer = setTimeout(function () { runCountdown(5); }, 2000);
    }

    function runCountdown(n) {
        S.introCountdown = n;
        if (n <= 0) {
            S.introCountdown = null;
            runAnimation(S.allWinners[0], S.entries);
            return;
        }
        var $title  = $('#intro-title-phase');
        var $count  = $('#intro-countdown');
        var accent  = S.settings.accentColor;

        $title.fadeOut(200, function () {
            $count.text(n).css({
                color: accent,
                'text-shadow': '0 0 80px ' + rgba(accent, 0.27)
            }).show().removeClass('countdown-pop');
            // Force reflow then re-add class to replay animation
            $count[0].offsetWidth; // jshint ignore:line
            $count.addClass('countdown-pop');
        });

        clearTimeout(S.introTimer);
        S.introTimer = setTimeout(function () { runCountdown(n - 1); }, 1000);
    }

    // ── Drawing Screen ────────────────────────────────────────────────────────

    function renderDrawingScreen() {
        refreshLogos();
        updateDrawingPlace();
        updateSlotMachine();
    }

    function updateDrawingPlace() {
        var total  = S.settings.winnerCount;
        var drawn  = S.drawnWinners.length;
        var place  = total - drawn;
        var accent = S.settings.accentColor;
        var isFirst = place === 1 && !S.isAnimating && S.currentWinner;
        $('#drawing-place').text(isFirst ? '🏆 1st Place' : ordinal(place) + ' Place').css('color', accent);
    }

    function updateSlotMachine() {
        var accent = S.settings.accentColor;

        $('#slot-empty').hide();
        $('#slot-spinning').hide();
        $('#slot-winner').hide();
        $('#next-draw-btn-wrap').hide();
        $('#auto-progress-wrap').hide();

        if (S.isAnimating) {
            $('#slot-spinning').show();
            $('#slot-machine').removeClass('winner-glow').css('border-color', rgba(accent, 0.2));

        } else if (S.currentWinner) {
            $('#winner-label').css('color', accent);
            $('#winner-name').text(S.currentWinner.name).css({
                color: accent,
                'text-shadow': '0 0 40px ' + rgba(accent, 0.53) + ', 0 0 80px ' + rgba(accent, 0.2)
            }).addClass('pulsing');

            if (S.currentWinner.id) {
                $('#winner-id').text('#' + S.currentWinner.id).css('color', rgba(accent, 0.8)).show();
            } else {
                $('#winner-id').hide();
            }
            $('#slot-winner').show();
            $('#slot-machine').addClass('winner-glow');

            if (S.autoMode) {
                var total = S.settings.winnerCount;
                var drawn = S.drawnWinners.length;
                $('#progress-label').text(drawn + ' / ' + total);
                $('#progress-bar').css({ width: ((drawn / total) * 100) + '%', background: accent });
                $('#auto-progress-wrap').show();
            } else {
                var totalW = S.settings.winnerCount;
                var drawnW = S.drawnWinners.length;
                var isLast = drawnW + 1 >= totalW;
                var btnText = isLast ? 'View All Results' : 'Draw ' + ordinal(totalW - drawnW - 1) + ' Place →';
                $('#btn-next-draw').text(btnText).css({
                    background: 'linear-gradient(135deg, ' + accent + ', ' + rgba(accent, 0.73) + ')',
                    'box-shadow': '0 4px 24px ' + rgba(accent, 0.27)
                });
                $('#next-draw-btn-wrap').hide().fadeIn(300);
            }

        } else {
            $('#slot-empty').show();
            $('#slot-machine').removeClass('winner-glow').css('border-color', rgba(accent, 0.2));
        }

        updateDrawingPlace();
    }

    // ── Slot Machine Animation ────────────────────────────────────────────────

    function runAnimation(winner, pool) {
        S.currentWinner = null;
        S.isAnimating   = true;
        $('#winner-name').removeClass('pulsing');

        if (S.screen !== 'drawing') {
            S.pendingAnimation = { winner: winner, pool: pool };
            showScreen('drawing');
            return; // onScreenReady → renderDrawingScreen will call updateSlotMachine
        }
        updateSlotMachine();

        var step = 0, totalSteps = 28;
        function tick() {
            var rnd = pool[Math.floor(Math.random() * pool.length)];
            $('#animating-name').text(rnd.name);
            step++;
            if (step < totalSteps) {
                var progress = step / totalSteps;
                S.animTimer = setTimeout(tick, 40 + progress * progress * 340);
            } else {
                S.isAnimating  = false;
                S.currentWinner = winner;
                onWinnerLanded();
            }
        }
        S.animTimer = setTimeout(tick, 40);
    }

    function onWinnerLanded() {
        updateSlotMachine();
        updateDrawingPlace();
        fireConfetti(S.settings.accentColor);

        if (S.autoMode) {
            clearTimeout(S.autoTimer);
            S.autoTimer = setTimeout(handleNextDraw, 3500);
        }
    }

    function handleNextDraw() {
        if (!S.currentWinner) return;
        var newDrawn = S.drawnWinners.concat([S.currentWinner]);
        S.drawnWinners  = newDrawn;
        S.currentWinner = null;

        if (newDrawn.length >= S.settings.winnerCount) {
            showScreen('results');
        } else {
            runAnimation(S.allWinners[newDrawn.length], S.entries);
        }
    }

    // ── Results Screen ────────────────────────────────────────────────────────

    function renderResultsScreen() {
        refreshLogos();
        var total    = S.settings.winnerCount;
        var many     = total > 5;
        var veryMany = total > 12;
        var logoSize = veryMany ? 64 : (many ? 80 : 120);
        var titleSz  = veryMany ? '1.5rem' : (many ? '1.75rem' : 'clamp(1.75rem,5vw,2.5rem)');

        $('#results-logo-inner').empty().append(buildLogoEl(logoSize));
        $('#results-event-name').text((S.settings.eventName || 'Draw') + ' Results').css('font-size', titleSz);

        var ordered = S.drawnWinners.slice().reverse(); // 1st place first
        var $container = $('#results-cards-container').empty();

        if (many) {
            var half = Math.ceil(ordered.length / 2);
            // Mobile: single column
            var $mob = $('<div>').addClass('d-md-none').css({ display: 'flex', flexDirection: 'column', gap: '8px' });
            // Desktop: two sequential columns
            var $dsk = $('<div>').addClass('d-none d-md-flex').css('gap', '12px');
            var $left  = $('<div>').css({ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' });
            var $right = $('<div>').css({ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' });

            ordered.forEach(function (w, i) {
                var place = i + 1;
                $mob.append(buildWinnerCard(w, place, many, veryMany));
                (i < half ? $left : $right).append(buildWinnerCard(w, place, many, veryMany));
            });
            $container.append($mob).append($dsk.append($left).append($right));
        } else {
            var $col = $('<div>').css({ display: 'flex', flexDirection: 'column', gap: '16px' });
            ordered.forEach(function (w, i) { $col.append(buildWinnerCard(w, i + 1, false, false)); });
            $container.append($col);
        }

        $('#results-actions').hide();

        // Kick off sequential card reveal
        setTimeout(function () {
            fireConfetti(S.settings.accentColor);
            revealNextCard(0, ordered.length);
        }, 300);
    }

    function buildWinnerCard(winner, place, many, veryMany) {
        var accent  = S.settings.accentColor;
        var isFirst = place === 1;
        // tag with place so revealNextCard can find it; start hidden
        var padding = veryMany ? '8px 12px' : (many ? '12px 16px' : '20px 24px');
        var nameSz  = veryMany ? '0.875rem' : (many ? '1rem' : '1.25rem');
        var badgeSz = many ? 36 : 48;
        var badgeFsz= many ? '0.75rem' : '1.125rem';
        var gap     = veryMany ? '8px' : '16px';

        var $card = $('<div>').addClass('winner-card').css({
            padding: padding, gap: gap,
            border: '1.5px solid ' + (isFirst ? rgba(accent, 0.33) : '#e2e8f0'),
            'box-shadow': isFirst
                ? '0 0 24px ' + rgba(accent, 0.09) + ', 0 2px 12px rgba(0,0,0,0.05)'
                : '0 1px 6px rgba(0,0,0,0.04)',
            background: isFirst
                ? 'linear-gradient(135deg, ' + rgba(accent, 0.05) + ', white)'
                : 'white'
        });

        var $badge = $('<div>').addClass('winner-badge flex-shrink-0').css({
            width: badgeSz + 'px', height: badgeSz + 'px', fontSize: badgeFsz,
            background: isFirst
                ? 'linear-gradient(135deg, ' + accent + ', ' + rgba(accent, 0.73) + ')'
                : '#f1f5f9',
            color: isFirst ? 'white' : accent
        }).html(isFirst ? '🏆' : ordinal(place).replace(/\D+$/, ''));

        var $info = $('<div>').addClass('flex-fill min-width-0');
        $info.append(
            $('<div>').addClass('text-uppercase font-weight-bold').css({
                fontSize: '0.6rem', letterSpacing: '0.1em', lineHeight: 1,
                marginBottom: '4px', color: isFirst ? accent : '#94a3b8'
            }).text(ordinal(place) + ' Place')
        );
        var $row = $('<div>').css({ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px' });
        $row.append($('<span>').addClass('text-dark font-weight-bold').css('fontSize', nameSz).text(winner.name));
        if (winner.id) {
            $row.append($('<span>').addClass('font-weight-bold').css({
                fontFamily: 'monospace', fontSize: nameSz, color: accent
            }).text('#' + winner.id));
        }
        $info.append($row);
        return $card.data('place', place).css('visibility', 'hidden').append($badge).append($info);
    }

    function revealNextCard(idx, total) {
        if (idx >= total) {
            $('#results-actions').css('display', 'flex').hide().fadeIn(400);
            return;
        }
        var place = idx + 1;
        $('#results-cards-container .winner-card').filter(function () {
            return $(this).data('place') === place;
        }).css('visibility', 'visible').addClass('revealed');
        S.revealTimer = setTimeout(function () { revealNextCard(idx + 1, total); }, 500);
    }

    // ── Draw Control ──────────────────────────────────────────────────────────

    function startDraw() {
        var count = Math.max(1, S.settings.winnerCount);
        S.allWinners   = pickWinners(S.entries, count);
        S.drawnWinners = [];
        S.currentWinner = null;
        S.isAnimating   = false;
        showScreen('intro');
    }

    function resetDraw() {
        clearTimeout(S.animTimer);
        clearTimeout(S.introTimer);
        clearTimeout(S.autoTimer);
        clearTimeout(S.revealTimer);
        S.drawnWinners  = [];
        S.currentWinner = null;
        S.isAnimating   = false;
        S.allWinners    = [];
        S.pendingAnimation = null;
        showScreen('setup');
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen && document.exitFullscreen();
        }
    }

    // ── Event Bindings ────────────────────────────────────────────────────────

    function bindEvents() {
        // Club name
        $('#inp-club-name').on('input', function () {
            S.settings.clubName = $(this).val();
            saveSettings(S.settings);
            refreshLogos();
        });

        // Logo upload
        $('#inp-logo').on('change', function () {
            var file = this.files && this.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function (e) {
                S.settings.logoUrl = e.target.result;
                saveSettings(S.settings);
                refreshLogos();
                $('#logo-upload-zone').text('Click to change logo');
            };
            reader.readAsDataURL(file);
        });
        $('#logo-upload-label').on('click', function (e) {
            // Prevent double-fire when clicking the file input itself
            if ($(e.target).is('#inp-logo')) return;
            $('#inp-logo').trigger('click');
        });

        // Winner count
        $('#inp-winner-count').on('input', function () {
            var n = parseInt($(this).val(), 10);
            if (!isNaN(n) && n > 0) { S.settings.winnerCount = n; saveSettings(S.settings); }
            updateStartBtn();
        });

        // Draw mode
        $(document).on('click', '.draw-mode-btn', function () {
            S.autoMode = $(this).data('mode') === 'auto';
            renderDrawModeBtns();
        });

        // Event selection
        $(document).on('click', '.event-btn', function () {
            var id = $(this).attr('data-evid');
            var ev = PLACEHOLDER_EVENTS.filter(function (e) { return e.id === id; })[0];
            if (!ev) return;
            S.selectedEventId = id;
            S.entries = ev.entries;
            S.settings.eventName = ev.name;
            saveSettings(S.settings);
            renderEventList();
            updateStartBtn();
        });

        // Color picker
        $('#inp-color-picker').on('input change', function () {
            var c = $(this).val();
            S.settings.accentColor = c;
            saveSettings(S.settings);
            applyAccent(c);
        });

        // Save preset
        $('#btn-save-preset').on('click', function () {
            var c = S.settings.accentColor;
            if (DEFAULT_COLORS.indexOf(c) >= 0 || S.savedPresets.indexOf(c) >= 0) return;
            S.savedPresets = S.savedPresets.concat([c]).slice(-12);
            savePresets(S.savedPresets);
            renderSwatches();
            updateSavePresetBtn();
        });

        // Start draw
        $('#btn-start-draw').on('click', function () {
            if (!$(this).prop('disabled')) startDraw();
        });

        // Next draw (one-by-one mode)
        $('#btn-next-draw').on('click', handleNextDraw);

        // Fullscreen toggle (delegated — appears on multiple screens)
        $(document).on('click', '.btn-fullscreen-toggle', toggleFullscreen);

        // Reset draw (delegated)
        $(document).on('click', '.btn-reset-draw', resetDraw);

        // Celebrate again
        $('#btn-celebrate').on('click', function () { fireConfetti(S.settings.accentColor); });

        // New draw
        $('#btn-new-draw').on('click', resetDraw);

        // Fullscreen API change
        document.addEventListener('fullscreenchange', function () {
            S.isFullscreen = !!document.fullscreenElement;
            updateTopbars();
        });
    }

    // ── Init ──────────────────────────────────────────────────────────────────

    function init() {
        bindEvents();
        applyAccent(S.settings.accentColor);
        showScreen('setup');
    }

    $(document).ready(init);

}(jQuery));
