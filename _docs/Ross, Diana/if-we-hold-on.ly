\version "2.22.0"

\header {
  title = "If We Hold On Together"
  composer = "Diana Ross"
  tagline = \markup {
    Engraved at
    \simple #(strftime "%Y-%m-%d" (localtime (current-time)))
    with \with-url #"http://lilypond.org/"
    \line { LilyPond \simple #(lilypond-version) (http://lilypond.org/) }
  }
}


\score {
  \relative c'' {
    \tempo 4 = 60
    
    r8 g8 c e g4. fis8
    fis f a c e,4 d
    
    r8 g,8 c e g4. fis8
    fis f a c e,4 d
    
    \break
    
    \relative c'' {
        d d8 e c4. g8
        d'4 d8 e c2
        d4 d8 e c4. g'8
        g4. f16 e d2
        
        \break
        
        a'4 e g e
        r8 c' b a g4 e
        a g8 f e4 f8 g~
        g d~ d2.
        
        \break
        
        a'4 e g e
        r8 c' b a g4 e
        a g8 f e4 d8 c
        d2.r4
        
        \break
        
        r8 g, c e g4~ g8. g,16
        a4~ a8. b16 b2
        r8 g c e g4. e8
        f4. e8 d2
        
        \break
        
        g,4 c8 e g4 c,8 c
        b'4~ b8. a16 a4 r8 c
        c,2 d4. e16 f
        
        \break
        
        e2 r4 r8 c'~
        c c,4. d c8
        c1
        
        \bar "|."
    }
  }
  
  \layout {}
  \midi {}
}
