document.addEventListener('DOMContentLoaded', () => {
    // --- Preset Data ---
    const presetData = {
        beginner: `Japanese,Meaning
こんにちは,안녕하세요
おはようございます,좋은 아침입니다
こんばんは,좋은 저녁입니다
さようなら,안녕히 가세요
ありがとう,고맙습니다
すみません,실례합니다 / 미안합니다
はい,네 / 예
いいえ,아니요
いち,일 (1)
に,이 (2)
さん,삼 (3)
し,사 (4)
ご,오 (5)
げつようび,월요일
かようび,화요일
すいようび,수요일
もくようび,목요일
きんようび,금요일
どようび,토요일
にちようび,일요일
わたし,나 / 저
あなた,당신
かれ,그
かのじょ,그녀
これ,이것
それ,그것
あれ,저것`,
        n5: `Japanese,Meaning
私 (わたし),나, 저
学校 (がっこう),학교
先生 (せんせい),선생님
学生 (がくせい),학생
友達 (ともだち),친구
本 (ほん),책
食べる (たべる),먹다
飲む (のむ),마시다
見る (みる),보다
聞く (きく),듣다
行く (いく),가다
来る (くる),오다
大きい (おおきい),크다
小さい (ちいさい),작다
高い (たかい),비싸다, 높다
安い (やすい),싸다
新しい (あたらしい),새롭다
古い (ふるい),낡다
良い (よい),좋다
悪い (わるい),나쁘다
今日 (きょう),오늘
明日 (あした),내일
昨日 (きのう),어제
今 (いま),지금
朝 (あさ),아침
昼 (ひる),점심, 낮
夜 (よる),밤
時間 (じかん),시간
人 (ひと),사람
男 (おとこ),남자
女 (おんな),여자
好き (すき),좋아함
上手 (じょうず),잘함, 능숙함
下手 (へた),서투름
元気 (げんき),건강, 활기
天気 (てんき),날씨
雨 (あめ),비
雪 (ゆき),눈
水 (みず),물
お茶 (おちゃ),차(마시는 것)
ご飯 (ごはん),밥, 식사
パン,빵
肉 (にく),고기
魚 (さかな),생선
野菜 (やさい),채소
果物 (くだもの),과일
買う (かう),사다
売る (うる),팔다
話す (はなす),이야기하다
書く (かく),쓰다`,
        travel: `Japanese,Meaning
これはいくらですか？,이거 얼마예요?
メニューをください,메뉴판 주세요
おすすめは何ですか？,추천 메뉴는 무엇인가요？
お願いします,부탁합니다
トイレはどこですか？,화장실은 어디인가요？
駅はどこですか？,역은 어디인가요?
チェックインをお願いします,체크인 부탁합니다
チェックアウトをお願いします,체크아웃 부탁합니다
もう一度お願いします,다시 한번 말씀해주세요
ゆっくり話してください,천천히 말해주세요
写真を撮ってもいいですか？,사진을 찍어도 될까요？
勘定をお願いします,계산서 부탁합니다
カードで払えますか？,카드로 계산할 수 있나요？
領収書をください,영수증을 주세요
助けてください,도와주세요
Wi-Fiはありますか？,와이파이 있나요？
パスワードを教えてください,비밀번호를 알려주세요
これをください,이것을 주세요
試着してもいいですか？,입어봐도 될까요？
免税でお願いします,면세로 부탁합니다`
    };

    // --- Element Selections ---
    const japaneseInput = document.getElementById('japanese-input');
    const meaningInput = document.getElementById('meaning-input');
    const addBtn = document.getElementById('add-btn');
    const resetBtn = document.getElementById('reset-btn');
    const playlist = document.getElementById('playlist');
    const playAllBtn = document.getElementById('play-all-btn');
    const exportBtn = document.getElementById('export-btn');
    const csvImportInput = document.getElementById('csv-import-input');
    const speedControls = document.querySelector('.speed-controls');
    const presetControls = document.querySelector('.preset-controls');
    const searchInput = document.getElementById('search-input');
    const progressCounter = document.getElementById('progress-counter');

    // --- State Variables ---
    let words = JSON.parse(localStorage.getItem('words')) || [];
    let isPlayingAll = false;
    let currentPlayIndex = 0;
    let playbackRate = 1.0;
    let currentAudio = null; // To manage the active audio element

    // --- Functions ---

    const saveWords = () => {
        localStorage.setItem('words', JSON.stringify(words));
    };

    const renderWords = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredWords = words.filter(word => 
            word.japanese.toLowerCase().includes(searchTerm) || 
            word.meaning.toLowerCase().includes(searchTerm)
        );

        playlist.innerHTML = '';
        if (words.length === 0) {
            playlist.innerHTML = '<p style="text-align: center; color: #888; padding: 2rem 0;">단어를 추가하거나<br>추천 단어장을 불러오세요.</p>';
            progressCounter.textContent = '0 / 0';
            return;
        }

        if (filteredWords.length === 0 && words.length > 0) {
            playlist.innerHTML = `<p style="text-align: center; color: #888; padding: 2rem 0;">'${searchInput.value}'에 대한<br>검색 결과가 없습니다.</p>`;
        }

        filteredWords.forEach((word) => {
            const originalIndex = words.findIndex(w => w.japanese === word.japanese && w.meaning === word.meaning);
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (word.mastered) {
                item.classList.add('mastered');
            }
            item.innerHTML = `
                <span><strong>${word.japanese}</strong> - ${word.meaning}</span>
                <div class="item-controls">
                    <button class="master-btn" data-index="${originalIndex}" title="학습 완료 토글">✔️</button>
                    <button class="speak-btn" data-lang="ja-JP" data-text="${word.japanese}" title="일본어 듣기">🇯🇵</button>
                    <button class="speak-btn" data-lang="ko-KR" data-text="${word.meaning}" title="뜻 듣기">🇰🇷</button>
                    <button class="delete-btn" data-index="${originalIndex}" title="단어 삭제">🗑️</button>
                </div>
            `;
            playlist.appendChild(item);
        });

        const masteredCount = words.filter(w => w.mastered).length;
        progressCounter.textContent = `${masteredCount} / ${words.length}`;
    };

    const stopSpeech = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.src = '';
            currentAudio = null;
        }
    };

    const speak = (text, lang, callback) => {
        stopSpeech(); // Stop any currently playing audio

        const googleLang = lang.split('-')[0];
        const processedText = text.replace(/~/g, '무엇무엇');
        const encodedText = encodeURIComponent(processedText);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${googleLang}&client=tw-ob`;
        
        const audio = new Audio(url);
        currentAudio = audio;
        audio.playbackRate = playbackRate;

        audio.play().catch(e => {
            console.error("Audio play failed:", e);
            if (isPlayingAll) {
                isPlayingAll = false;
                playAllBtn.textContent = '연속 재생';
            }
        });
        
        audio.onended = () => {
            currentAudio = null;
            if (callback) {
                callback();
            }
        };

        audio.onerror = (e) => {
            console.error("Audio playback error:", e);
            currentAudio = null;
            if (isPlayingAll) {
                isPlayingAll = false;
                playAllBtn.textContent = '연속 재생';
            }
        };
    };

    const playAll = () => {
        const currentlyVisibleWords = words.filter(word => 
            (word.japanese.toLowerCase().includes(searchInput.value.toLowerCase()) || 
            word.meaning.toLowerCase().includes(searchInput.value.toLowerCase())) && !word.mastered
        );

        if (currentPlayIndex < currentlyVisibleWords.length && isPlayingAll) {
            const currentWord = currentlyVisibleWords[currentPlayIndex];
            speak(currentWord.japanese, 'ja-JP', () => {
                if (!isPlayingAll) return;
                setTimeout(() => {
                    if (!isPlayingAll) return;
                    speak(currentWord.meaning, 'ko-KR', () => {
                        if (!isPlayingAll) return;
                        currentPlayIndex++;
                        playAll();
                    });
                }, 500 / playbackRate);
            });
        } else {
            isPlayingAll = false;
            playAllBtn.textContent = '연속 재생';
            currentPlayIndex = 0;
        }
    };

    const handleAddWord = () => {
        const japanese = japaneseInput.value.trim();
        const meaning = meaningInput.value.trim();
        if (japanese && meaning) {
            words.push({ japanese, meaning, mastered: false });
            saveWords();
            renderWords();
            japaneseInput.value = '';
            meaningInput.value = '';
            japaneseInput.focus();
        }
    };

    const loadWordsFromText = (text) => {
        const newWords = [];
        const rows = text.trim().split(/\r?\n/);
        const header = rows.shift().toLowerCase().split(',');

        const japaneseIndex = header.indexOf('japanese');
        const meaningIndex = header.indexOf('meaning');
        const masteredIndex = header.indexOf('mastered');

        rows.forEach(row => {
            if (row.trim() === '') return;
            const columns = row.split(',');
            const japanese = (columns[japaneseIndex] || '').trim().replace(/"/g, '');
            const meaning = (columns[meaningIndex] || '').trim().replace(/"/g, '');
            
            let mastered = false;
            if (masteredIndex !== -1 && columns[masteredIndex]) {
                mastered = columns[masteredIndex].trim().toLowerCase() === 'true';
            }

            if (japanese && meaning) {
                newWords.push({ japanese, meaning, mastered });
            }
        });

        if (newWords.length === 0) {
            alert("유효한 단어를 찾지 못했습니다. CSV 파일 형식을 확인해주세요.");
            return;
        }

        const append = words.length > 0 && confirm(`가져온 ${newWords.length}개의 단어를 현재 목록에 추가하시겠습니까?\n('취소'를 누르면 기존 목록을 대체합니다.)`);
        if (append) {
            words = [...words, ...newWords];
        } else {
            words = newWords;
        }
        saveWords();
        renderWords();
        alert("단어를 성공적으로 불러왔습니다!");
    };

    // --- Event Listeners ---

    addBtn.addEventListener('click', handleAddWord);
    meaningInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleAddWord());
    searchInput.addEventListener('input', renderWords);

    playlist.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const index = target.getAttribute('data-index');

        if (target.classList.contains('delete-btn')) {
            words.splice(index, 1);
            saveWords();
            renderWords();
        } else if (target.classList.contains('speak-btn')) {
            const text = target.getAttribute('data-text');
            const lang = target.getAttribute('data-lang');
            speak(text, lang);
        } else if (target.classList.contains('master-btn')) {
            if (words[index]) {
                words[index].mastered = !words[index].mastered;
                saveWords();
                renderWords();
            }
        }
    });

    resetBtn.addEventListener('click', () => {
        if (words.length > 0 && confirm('정말로 모든 단어를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            stopSpeech();
            isPlayingAll = false;
            playAllBtn.textContent = '연속 재생';
            words = [];
            saveWords();
            searchInput.value = '';
            renderWords();
        }
    });

    playAllBtn.addEventListener('click', () => {
        if (!isPlayingAll) {
            const currentlyVisibleWords = words.filter(word => 
                (word.japanese.toLowerCase().includes(searchInput.value.toLowerCase()) || 
                word.meaning.toLowerCase().includes(searchInput.value.toLowerCase())) && !word.mastered
            );
            if (currentlyVisibleWords.length === 0) {
                alert("재생할 단어가 없거나, 모든 단어를 학습 완료했습니다.");
                return;
            }
            isPlayingAll = true;
            playAllBtn.textContent = '정지';
            currentPlayIndex = 0;
            playAll();
        } else {
            isPlayingAll = false;
            stopSpeech();
            playAllBtn.textContent = '연속 재생';
        }
    });

    speedControls.addEventListener('click', (e) => {
        const target = e.target.closest('.speed-btn');
        if (target) {
            playbackRate = parseFloat(target.getAttribute('data-speed'));
            speedControls.querySelector('.active').classList.remove('active');
            target.classList.add('active');
        }
    });

    presetControls.addEventListener('click', (e) => {
        const target = e.target.closest('.preset-btn');
        if (target) {
            const preset = target.getAttribute('data-preset');
            if (presetData[preset]) {
                loadWordsFromText(presetData[preset]);
            }
        }
    });

    exportBtn.addEventListener('click', () => {
        if (words.length === 0) {
            alert("내보낼 단어가 없습니다.");
            return;
        }
        let csvContent = "Japanese,Meaning,Mastered\n";
        words.forEach(word => {
            const jp = word.japanese.includes(',') ? `"${word.japanese}"` : word.japanese;
            const mn = word.meaning.includes(',') ? `"${word.meaning}"` : word.meaning;
            csvContent += `${jp},${mn},${word.mastered || false}\n`;
        });
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "japanese_flashcards.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    csvImportInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                loadWordsFromText(e.target.result);
            } catch (error) {
                console.error("Error parsing CSV:", error);
                alert("CSV 파일을 처리하는 중 오류가 발생했습니다.");
            } finally {
                csvImportInput.value = '';
            }
        };
        reader.readAsText(file, 'UTF-8');
    });

    // --- Initial Load ---
    renderWords();
});