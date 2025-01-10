Qualtrics.SurveyEngine.addOnReady(function() {
    // 페이지 로드 시 이전 문항에서 선택된 라디오 버튼 자동 선택 및 변경 이벤트 트리거
    var previousSelection = Qualtrics.SurveyEngine.getEmbeddedData('previousRadioSelection');
	if (!previousSelection){ 
		previousSelection = "writer";
	}
	console.log(previousSelection)
    var radioButtons = document.querySelectorAll('#radio-container input[type="radio"]');  
    if (previousSelection) {
        radioButtons.forEach(function(radio) {
            if (radio.value === previousSelection) {
                radio.checked = true;
                setTimeout(function() {
                    radio.dispatchEvent(new Event('change'));
                }, 500);
            }
        });
    } else {
        var firstRadio = radioButtons[0];
        if (firstRadio) {
            firstRadio.checked = true;
            setTimeout(function() {
                firstRadio.dispatchEvent(new Event('change'));
            }, 500);
        }
    }

    radioButtons.forEach(function(radio) {
        radio.addEventListener('change', function() {
            radioButtons.forEach(function(otherRadio) {
                if (otherRadio !== radio) {
                    otherRadio.parentElement.style.transition = "opacity 1s ease";
                    otherRadio.parentElement.style.opacity = "0";
                    setTimeout(function() {
                        otherRadio.parentElement.style.display = "none";
                    }, 1000);
                }
            });
            this.parentElement.classList.add('active');
        });
    });
	
	
	
	//// GPT
    // 화면에 표시할 전체 대화 내역
    var conversationHistory1 = [];

    // Embedded Data에서 저장된 대화 내역을 복원
    var savedHistory = Qualtrics.SurveyEngine.getEmbeddedData('conversationHistory1');
    if (savedHistory) {
        conversationHistory1 = JSON.parse(savedHistory);
        // 채팅창에 이전 메시지 표시
        conversationHistory1.forEach(function(message) {
            displayMessageInChatHistory(message.role, message.content);
        });
    }

    var promptCounter1 = 0; // User 메시지 개수

    var persona = previousSelection ? Qualtrics.SurveyEngine.getEmbeddedData(previousSelection) : "";
    var system_message_front = Qualtrics.SurveyEngine.getEmbeddedData('system_message_front');
    var system_message_back = Qualtrics.SurveyEngine.getEmbeddedData('system_message_back');
    persona = system_message_front + persona + system_message_back;

    function displayMessageInChatHistory(role, message) {
        var chatHistory = document.getElementById("chat-history-1");
        var messageElement = document.createElement("div");
        messageElement.classList.add("message", role === "user" ? "user-message" : "bot-message");
        messageElement.textContent = (role === "user" ? "User: " : "AI: ") + message;
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function displayWelcomeMessage() {  // 웰컴 메시지
        displayMessageInChatHistory("assistant", "안녕하세요!");
    }

        // 대화 내역이 없을 때만 웰컴 메시지 표시
        displayWelcomeMessage();

    function displayInstantly(botMessage, delay) {
        setTimeout(function() {
            displayMessageInChatHistory("assistant", botMessage);
        }, delay);
    }

    function sendMessage() {
        if (promptCounter1 >= 12) {
            displayMessageInChatHistory("assistant", "--- 대화 횟수가 만료되었습니다 ---");
            return;
        }

        var messageInput = document.getElementById("message-input-1");
        var message = messageInput.value.trim();
        if (message) {
            promptCounter1++;

            // 화면에 표시할 대화 내역에 추가
            conversationHistory1.push({ role: "user", content: message });
            displayMessageInChatHistory("user", message);

            // Fetch로 API 호출
            fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + "${e://Field/api_key}"
                },
                body: JSON.stringify({
                    model: "${e://Field/model}",
                    messages: [
                        {
                            role: "system",
                            content: persona
                        },
                        ...conversationHistory1 // API에는 전체 대화 내역 포함
                    ],
                    temperature: parseFloat("${e://Field/temperature}"),
                    max_tokens: parseInt("${e://Field/max_tokens}"),
                    n: 1
                })
            })
            .then(response => response.json())
            .then(data => {
                var botMessage = data.choices[0].message.content.trim();

                // 화면에 표시할 대화 내역에 AI 응답 추가
                conversationHistory1.push({ role: "assistant", content: botMessage });
                displayInstantly(botMessage, 0);

                // 대화 내역을 Embedded Data에 저장
                Qualtrics.SurveyEngine.setEmbeddedData('conversationHistory1', JSON.stringify(conversationHistory1));
            })
            .catch(error => console.error(error));
            messageInput.value = "";
        }
    }

    var sendButton = document.getElementById("send-button-1");
    sendButton.addEventListener("click", sendMessage);

    var messageInput = document.getElementById("message-input-1");
    messageInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});
