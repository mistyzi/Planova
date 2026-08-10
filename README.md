# Planova - Your study schedule, astronomically aligned. 

Planova is a space-inspired study companion built to help users stay organized and focused while navigating their academic universe. 

Designed with a calm cosmic aesthetic and adaptive dark/light themes, Planova keeps every study tool in the same orbit — making learning feel smoother, lighter, and a little more celestial.

With essentials like a task tracker, focus timer, notes, and flashcards, Planova helps learners stay on course as they explore new worlds of knowledge.


★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★

## ★ APP FEATURES !!
- Task Tracker — *organize tasks and stay productive*
- Focus Timer — *customizable study timer*
- Background Music Player — *ambient study music*
- Daily Streak Tracker — *track your consistency*
- Note Uploading — *create and store notes*
- Flashcard Creator — *build flashcards*
- Reference Library — *save reference items*
- Dark/Light Theme — *full theme system*
- OCR Scanning — *scan text from images*
- Text-to-Speech Reader — *listen to notes*
- Bookmarks — *access to user settings*
- Profile Sheet — *save important items*
- Notification System — *reminders, alerts, and study‑related updates*
- Tab Navigation — *fast navigation to core tools*

★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★・・・★

## ★ PROJECT STRUCTURE !!

	PLANOVA/
	├── app/						# All Screens (Expo Router)
	│   ├── _layout.tsx				# Root Layout
	│   ├── index.tsx 				# Home Screen
	│ 
	│   ├── (tabs)/					# Tab Navigation
	│   │ 	├── _layout.tsx			# Tab Layout
	│   │ 	├── index.tsx			# Home Tab
	│   │ 	├── tasks.tsx			# Tasks Tab
	│   │ 	└── study.tsx			# Study Tab
	│
	│   ├── bookmarkMaker.tsx		# Bookmark Maker
	│   ├── bookmarks.tsx			# Bookmark List
	│
	│   ├── note.tsx				# Note Editor
	│   ├── notes.tsx				# Notes List
	│   
	│   ├── flashcards.tsx 			# Flashcard List
	│   ├── flashcardMaker.tsx		# Flashcard Maker
	│
	│   ├── focusSession.tsx		# Timer Session
	│   ├── focusTimer.tsx			# Timer Setter
	│
	│   ├── studyGuides.tsx			# Study Guide List
	│   ├── studyGuideMaker.tsx		# Study Guide Maker
	│   ├── studyGuide.tsx			# Study Guide
	│  
	│   ├── referenceLibrary.tsx	# Stored References
	│   ├── referenceMaker.tsx		# Reference Maker
	│
	│  	└── ocr.ts					# OCR Scanning Logic
	│
	├── assets/   
	│   ├── icon.png				# Mobile App Icon
	│   ├── fonts/					# Custom Fonts
	│   └── music/					# Audio Files
	│ 
	├── components/     			# Reusable UI Components  
	│   ├── focusTimerOverlay.tsx
	│   ├── header.tsx
	│   ├── musicselector.tsx
	│   ├── profilesheet.tsx
	│   └── starrybackground.tsx
	│ 
	├── context/					# Global State (React Context)
	│	├── focustimercontext.tsx
	│	├── profilesheetcontext.tsx
	│   └── themecontext.tsx
	│
	├── storage/    TO DO
	│
	├── utils/   					# Secure OCR Key Loader
	│   └── ocr.ts
	│
	├── app.config.ts       
	├── package.json    
	└── tsconfig.json 
