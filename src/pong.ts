
import { fromEvent,interval,merge,timer} from 'rxjs' ; 
import { map,filter,flatMap,takeUntil,scan } from 'rxjs/operators';


// Author : Foong Shee Yao
// Student ID : 31281125

//Constants
const Constants = new class{
  readonly CanvasSize = 600 ;    
}


function pong() {      
    type State =  Readonly<{
      readonly x: number;
      readonly y: number ; 
      readonly x2:number ; 
      readonly y2: number ;        
      readonly ball : Ball ; 
      readonly paddleWidth : number ;       
      readonly paddleHeight : number ; 
                          
    }>

    //Ball 
    type Ball = Readonly<{     
      readonly x : number ; 
      readonly y : number ;     
      readonly r : number  ;      
      readonly collision : boolean ;  
      readonly collisionType : Collision ; 
      readonly lastCollided : "player" | "computer" | "None" 
      readonly playerScore :  number ;
      readonly aiScore: number ;
      readonly gameOver: boolean ; 
      readonly restart : boolean ; 
      readonly color : string ;  
    }>

    type Collision = "Top" | "Bottom" | "Center" | "topWall" | "bottomWall" | "playerGoal" | "aiGoal"

    const canvas = document.getElementById("canvas") ;
    const paddlePlayer = document.getElementById("paddle1"); 
    const paddleAI = document.getElementById("paddle2") ; 
    
    //Create Ball element 
    const ball  = document.createElementNS(canvas.namespaceURI , "circle") ; 
    canvas.appendChild(ball)

    //handy methods 
    const attr =(e : Element , o : Object) => {for (const k in o) e.setAttribute(k , String(o[k]))}
    
    const scoreDisplayPlayer = document.createElementNS(canvas.namespaceURI, "text");    
    attr(scoreDisplayPlayer,{x:Constants.CanvasSize/4,y:Constants.CanvasSize/4,class:"player_Score",fill:"blue"});
    scoreDisplayPlayer.textContent = "0";           
    canvas.appendChild(scoreDisplayPlayer) 

    const scoreDisplayAI = document.createElementNS(canvas.namespaceURI, "text");    
    attr(scoreDisplayAI,{x:3*Constants.CanvasSize/4,y:Constants.CanvasSize/4,class:"ai_Score",fill:"blue"});
    scoreDisplayAI.textContent = "0";           
    canvas.appendChild(scoreDisplayAI) 

    const restartText = document.createElementNS(canvas.namespaceURI, "text");
    attr(restartText,{x:Constants.CanvasSize/3,y:Constants.CanvasSize/2+20,class:"restart_Text",fill:"red"});    
    canvas.appendChild(restartText) 

    const gameOverText = document.createElementNS(canvas.namespaceURI, "text")!;
    attr(gameOverText,{x:Constants.CanvasSize/6,y:Constants.CanvasSize/2,class:"gameover",fill:"red"});
    canvas.appendChild(gameOverText)
  
  
    // Ball 
    const initialBallState : Ball = {x:Constants.CanvasSize/2,y: Constants.CanvasSize/2 ,r:5 , color:"red" , collision: false , collisionType:"Center" , lastCollided:"None" , playerScore: 0 , aiScore:0 , gameOver: false , restart: false}
    const initialState :State ={x:20,y:250, ball : initialBallState  , x2 :480 , y2:250 , paddleWidth:10 , paddleHeight : 50 };    

 
   

    function playerMove(s:State,distance:number):State{
      return{...s, // copy all the attributes , only the y changed
        y:s.y + distance 
      }
    }
    
   

   
    function checkCollision(b:Ball):Ball{        

          //Some methods to produce the matrix of position of paddles
          const style = window.getComputedStyle(paddlePlayer) 
          const styleTwo = window.getComputedStyle(paddleAI)
          const matrixOne = style.transform //It will produce a matrix like : "matrix(1, 0, 0, 1, 20, 250)" , the last two value in the matrix are the position of x and the position of y of paddle.
          const matrixTwo = styleTwo.transform
          //Paddle1 
          const matrixValuesPaddleOne = matrixOne.match(/matrix.*\((.+)\)/)[1].split(',')//decomposing the matrix
          const paddleOneX = +matrixValuesPaddleOne[4] // This is the exact position of x of paddle player (which will keep follow changing)
          const paddleOneY = +matrixValuesPaddleOne[5] // This is the exact position of y of paddle player (which will keep follow changing)
          //Paddle2 
          const matrixValuesPaddleTwo = matrixTwo.match(/matrix.*\((.+)\)/)[1].split(',') //decomposing the matrix
          const paddleTwoX = +matrixValuesPaddleTwo[4] // This is the exact position of x of paddle AI (which will keep follow changing)
          const paddleTwoY = +matrixValuesPaddleTwo[5] // This is the exact position of y of paddle AI (which will keep follow changing)
          //Common Constants          
          const paddleWidth = initialState.paddleWidth
          const paddleHeight = initialState.paddleHeight 
          
                                       

          //Check if paddle 1 is touched with ball          
          if(b.gameOver){                                  
            const restart = fromEvent(document,"keydown").pipe(filter((x:KeyboardEvent)=>x.key=="1")).subscribe(()=>ballMove({...b,restart:true},10))
            restartText.textContent = "Press 1 to Restart the Game"                                   
            if(b.aiScore==7){                            
              gameOverText.textContent = "AI Win the Game";                                        
            }else{                            
              gameOverText.textContent = "Player Win the Game";                          
            }
              //Unsubscribe the subscriptions                           
              playerObservable.unsubscribe()
              ballObservable.unsubscribe()
              computerObservable.unsubscribe()
            
          }
            
          //Goal Collision : aiGoal means player put the ball into the ai goal vice versa as AI
          if(b.x>=Constants.CanvasSize){
            return{...b,collision:true,collisionType:"aiGoal"}
          }else if(b.x<= 0){
            return{...b,collision:true , collisionType:"playerGoal"}
          }
          

          //Wall Collision           

          if(b.y>=Constants.CanvasSize) {               
            return {...b,collision:true,collisionType:"bottomWall"}
          }else if(b.y <= 0 ){            
            return {...b,collision:true,collisionType:"topWall"}
          }          

          //Paddle1 collision
          //25 is the deviation value I found in the canvas 
          // b.x -50 because the paddle1.x = 20 , width = 10 , but b.x = 80 when it touch the paddl1
          if(b.lastCollided=="computer" || b.lastCollided == "None"){
            if(b.x>paddleOneX && b.x-50<= paddleOneX + paddleWidth ){                                         
              if(b.y>paddleOneY && b.y<=(paddleOneY + paddleHeight+25) ){
                if(Math.abs(((paddleOneY+paddleHeight)+25) - b.y) < 10){                                                                
                  return {...b,collision:true,collisionType:"Bottom",lastCollided:"player"}  
                }else if(Math.abs((paddleOneY+paddleHeight+25) - b.y) > 30){                                
                  return {...b,collision:true,collisionType:"Top",lastCollided:"player"}
                }else{                                
                  return {...b,collision:true,collisionType:"Center",lastCollided:"player"}
                }
              }
            }        
          }else{
          //Paddle2 Collision
          
          if(b.x>paddleTwoX && b.x <= paddleTwoX + paddleWidth){
            if(b.y>paddleTwoY && b.y<=paddleTwoY + paddleHeight+25 ){  
                                      
              if(Math.abs((paddleTwoY+paddleHeight+25-b.y)) < 10){                                                                
                return {...b,collision:true,collisionType:"Bottom",lastCollided:"computer"}  
              }else if(Math.abs(paddleTwoY+paddleHeight+25-b.y)>25){                                
                return {...b,collision:true,collisionType:"Top",lastCollided:"computer"}
              }else{                                
                return {...b,collision:true,collisionType:"Center",lastCollided:"computer"}
              }
              

            }
          }

        }
          
          return{...b}
         
    }
    
    function ballMove(b:Ball,distance:number):Ball {
            
        b = checkCollision(b)      
        if(b.restart){
          window.location.reload()                
        }  
        //Check if the ball is in bound
        if(b.collisionType!="topWall" &&b.collisionType!= "bottomWall"&& b.collisionType!="playerGoal" && b.collisionType!="aiGoal"){                                 
        if(b.collision){          
          if(b.collisionType=="Top"){                                       
            return b.lastCollided=="player"?{...b,x:b.x+distance,y:b.y-distance,collision:true}:{...b,x:b.x-distance,y:b.y-distance,collision:true}                      
          }else if(b.collisionType=="Bottom"){                          
            return b.lastCollided=="player"?{...b,x:b.x+distance,y:b.y+distance,collision:true}:{...b,x:b.x-distance,y:b.y+distance,collision:true}       
          }else{     
            
            //Center Collision
            return b.lastCollided=="player"?{...b,x:b.x+distance,collision:true}:{...b,x:b.x-distance,collision:true}
          }
        }else{
          // The initial state of ball without collision           
          return {...b,x:b.x-distance,collision:false}           
        
        }

      }//If it is out of bound
      else{       
        //Goal collisions handle 
        if(b.x >= Constants.CanvasSize || b.x<= 0) {
          if(b.collisionType=="playerGoal"){  
            scoreDisplayAI.textContent = String(b.aiScore+1)                                
            return b.aiScore+1!=7?{...b,x:initialBallState.x-distance,y:initialBallState.y,collision:true , aiScore:b.aiScore+1,collisionType:"Center"}:{...b,x:initialBallState.x,y:initialBallState.y,aiScore:b.aiScore+1,gameOver:true}
          }else if(b.collisionType=="aiGoal"){ 
            scoreDisplayPlayer.textContent = String(b.playerScore+1)           
            return b.playerScore+1!=7?{...b,x:initialBallState.x+distance,y:initialBallState.y,collision:true , playerScore:b.playerScore+1 , collisionType: "Center"}:{...b,x:initialBallState.x,y:initialBallState.y,playerScore:b.playerScore+1,gameOver:true}
          }
        }else{
          //Wall collisions handle 

          if(b.collisionType=="topWall"){                                          
            return b.lastCollided=="player"?{...b,x:b.x+distance,y:b.y+distance,collision:true}:{...b,x:b.x-distance,y:b.y+distance,collision:true}
            //top wall collision

          }else if(b.collisionType=="bottomWall"){                                           
            return b.lastCollided=="player"?{...b,x:b.x+distance,y:b.y-distance,collision:true}:{...b,x:b.x-distance,y:b.y-distance,collision:true}
            //bottom wall collision

          }
        }
      }
      
                
    }
    function computerMove(s:State):State{ 
      const styleAI = window.getComputedStyle(paddleAI)
      const matrixAI = styleAI.transform
      const matrixValuesPaddleAI = matrixAI.match(/matrix.*\((.+)\)/)[1].split(',')
      const paddleAI_Y = +matrixValuesPaddleAI[5] // initial paddleAI y position  :250      
      const ballX = +ball.getAttribute("cx")   
      const ballY = +ball.getAttribute("cy")            
      const ballInBound = ballX < Constants.CanvasSize&&ballX>0            

      //b.y -paddle.y < 0 : go up 
      //b.y -paddle.y > 0 : go down 
      return ballY-(paddleAI_Y+50)<0&&ballInBound?{...s,y2:s.y2-8}:ballY-(paddleAI_Y+50)>0&&ballInBound?{...s,y2:s.y2+8}:{...s,y2:s.y2}
    }

    function computerPlayer(s:State):void{      
      if(s.y2> -20 &&s.y2<528){        
        paddleAI.setAttribute('transform' , `translate(${s.x2},${s.y2})`)
      }
       
      
    }

    function createBall(b:Ball):void{                         
      ball.setAttribute("cx" , String(b.x)) ; 
      ball.setAttribute("cy" , String(b.y)) ; 
      ball.setAttribute("r" , String(b.r)) ; 
      ball.setAttribute("fill" , b.color) ;       
    }

    function playerPaddleView(state:State):void{                        
      if(state.y> -20 &&state.y<528){             
        paddlePlayer.setAttribute('transform' , `translate(${state.x},${state.y})`)
      }
     
    }                   
  
  
  //Ball movement
  const ballObservable = interval(50).pipe(map(d=>10),scan(ballMove,initialBallState)).subscribe(createBall)
  //Player paddle
  const playerObservable = fromEvent<KeyboardEvent>(document,'keydown')
    .pipe(      
      filter(({repeat})=>!repeat),
      filter(({keyCode:k})=>k===38 || k===40),
      flatMap(({keyCode:downKeyCode})=>interval(10).pipe(
        takeUntil(
          fromEvent<KeyboardEvent>(document,'keyup').pipe(
            filter(up=>up.keyCode === downKeyCode))),
        map(_=>downKeyCode))                   
        ),
        map(downKeyCode=>downKeyCode===38?-4:4),//keycode 38:up,40:down,
        scan(playerMove,initialState))
        .subscribe(playerPaddleView)

  // Computer paddle  
  const computerObservable = interval(30).pipe(map(d=>d),scan(computerMove,initialState)).subscribe(computerPlayer)
  
  
  }
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }
  
  
  
