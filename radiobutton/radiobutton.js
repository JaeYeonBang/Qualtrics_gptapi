Qualtrics.SurveyEngine.addOnReady(function() {
	
// 라디오 버튼 코드 
// 라디오 버튼 클릭 이벤트 리스너 추가
	
  document.querySelectorAll('#radio-container input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      // 선택된 라디오 버튼 값 입력 필드에 설정
      var selectedValue = this.value;
      
      // 모든 라디오 버튼에서 active 클래스를 제거
      document.querySelectorAll('#radio-container label').forEach(function(label) {
        label.classList.remove('active');
      });

      // 현재 선택된 라디오 버튼에 해당하는 label에 active 클래스 추가
      this.parentElement.classList.add('active');
		
	  Qualtrics.SurveyEngine.setEmbeddedData('previousRadioSelection', selectedValue);
		
		
    });
  });
	
});
