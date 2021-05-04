\version "2.22.1"

\header {
  title = "Yesterday Once More"
  composer = "Carpenter"
}

\score {
  <<
  \new ChordNames {
    \chordmode {
      r1
      ees g:m c:m c:m/bes
      aes:maj7 g:m7 f:m7

      ees g:m c2:m c:m/bes
      aes:maj7 d4:m7-5 g:7
      c1:m c:m/bes aes2:maj7 f:m7 bes
    }
  }
  
  \new Staff \relative ees' {
    \key ees \major
    \clef 	treble
    r2 r8 ees8 ees f
    g4 bes bes8 g bes g
    c bes4 g4. g8 bes
    c4 d4 g,8 bes4 c8~
    
    \break
 
    c2 r4 g8 bes
    c4 g' f8 ees4 d8~
    d4. bes8 g bes4 g8
    f2 r8 ees8 ees f
    
    \break
    
    g4 bes bes8 g bes g
    c bes4 g4. g8 bes
    c4 d4 g,8 bes4 c8~
    c2 d4 f
    
    \break
    
    ees8 d4 d d8 ees d
    ees d4 c4. c8 d
    ees4 ees c8 ees4 f8~
    f1
  }
  >>

  \layout {}
  \midi {
    \tempo 4 = 128
  }
}