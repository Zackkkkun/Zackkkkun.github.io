/**
 * The functionality of this script is inspired by these codepens:

 * - https://codepen.io/veljamatic/pen/pypxRR - canvas-dot-grid
 *   - Draw a grid of dots on a canvas

 * - https://codepen.io/efriberg/pen/ExaxzKq - Interactive Dot Grid
 *   - Repulsion effect based on mouse position

 * - https://codepen.io/BuiltByEdgar/pen/gvEPya - Dot grid (canvas)
 *   - Twinkle effect of the dots on the canvas
 */

export class StarField {
  // Canvas element and its 2D context
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D | null

  // Array that stores stars with their properties: position, alpha (opacity), and speed
  private stars: Array<{
    x: number
    y: number
    originalX: number
    originalY: number
    alpha: number
    speed: number
  }> = []

  // Mouse position and configuration constants
  private readonly mousePosition = { x: -1000, y: -1000 } // Initial mouse position outside the canvas
  private readonly SPACING = 18 // Spacing between stars
  private readonly starRadius = 1 // Radius of each star
  private readonly influenceRadius = 80 // Influence radius for mouse repulsion effect
  private canvasWidth: number
  private canvasHeight: number

  // Color of the stars (white by default)
  private starColor = '255, 255, 255'

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = this.canvas?.getContext('2d') ?? null

    // Assign canvas dimensions
    this.canvasWidth = this.getCanvasWidth()
    this.canvasHeight = this.getCanvasHeight()

    // Verify if the context is valid before proceeding
    if (this.context !== null) {
      this.initStars() // Initialize stars
      this.resizeCanvas() // Adjust canvas size
      this.drawStars() // Draw the stars
      this.addEventListeners() // Add mouse events
    } else {
      console.error('The 2D context could not be obtained.')
    }

    // Add event to resize canvas when window size changes
    window.addEventListener('resize', this.onResize.bind(this), false)
  }

  // Get canvas width
  private getCanvasWidth(): number {
    return this.canvas.clientWidth
  }

  // Get canvas height
  private getCanvasHeight(): number {
    return this.canvas.clientHeight
  }

  // Resize canvas
  private resizeCanvas(): void {
    this.canvas.width = this.canvasWidth
    this.canvas.height = this.canvasHeight
  }

  // Initialize stars with random positions and properties
  private initStars(): void {
    this.stars = []

    // Generate stars on the canvas, initialize x and y position at -5 to adjust correctly
    for (let x = -5; x < this.canvasWidth; x += this.SPACING) {
      for (let y = -5; y < this.canvasHeight; y += this.SPACING) {
        this.stars.push({
          x,
          y,
          originalX: x, // Save original position for the "return" effect
          originalY: y,
          alpha: Math.random(), // Random opacity
          speed: Math.random() * 0.005 + 0.002 // Opacity variation speed
        })
      }
    }
  }

  // Draw stars and apply repulsion effect based on mouse position
  private drawStars(): void {
    if (this.context !== null) {
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight) // Clear the canvas
    }

    this.stars.forEach((star) => {
      // Calculate distance between mouse and star
      const dx = this.mousePosition.x - star.x
      const dy = this.mousePosition.y - star.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // If star is within mouse influence radius, apply repulsion
      if (distance < this.influenceRadius) {
        const angle = Math.atan2(dy, dx) // Direction angle towards mouse
        const force = (this.influenceRadius - distance) / this.influenceRadius // Repulsion force
        star.x = star.originalX - Math.cos(angle) * force * 20 // Move star away from mouse
        star.y = star.originalY - Math.sin(angle) * force * 20
      } else {
        // If star is outside influence radius, return to original position
        star.x += (star.originalX - star.x) * 0.05
        star.y += (star.originalY - star.y) * 0.05
      }

      // Update star opacity (alpha) with its speed
      star.alpha += star.speed
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed = -star.speed // Reverse opacity change direction
      }

      // Draw each star with its color (depending on theme) and opacity
      if (this.context !== null) {
        this.context.fillStyle = `rgba(${this.starColor}, ${Math.abs(star.alpha)})`
        this.context.beginPath()
        this.context.arc(star.x, star.y, this.starRadius, 0, Math.PI * 2) // Draw the star
        this.context.fill()
      }
    })

    // Continue animation in next frame
    requestAnimationFrame(this.drawStars.bind(this))
  }

  // Add mouse events: move and leave canvas area
  private addEventListeners(): void {
    this.canvas.parentElement?.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this)
    )
    this.canvas.parentElement?.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    )
  }

  // Update mouse position when moving within canvas
  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    this.mousePosition.x = event.clientX - rect.left
    this.mousePosition.y = event.clientY - rect.top
  }

  // When leaving canvas, place mouse at position outside visible area
  private onMouseLeave(): void {
    this.mousePosition.x = -1000
    this.mousePosition.y = -1000
  }

  // Resize canvas and reinitialize stars when window changes size
  private onResize(): void {
    this.canvasWidth = this.getCanvasWidth()
    this.canvasHeight = this.getCanvasHeight()
    this.resizeCanvas()
    this.initStars()
  }
}
