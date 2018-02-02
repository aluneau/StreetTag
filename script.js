$(function () {
  //Canvas setup
    const canvas = $(".wrapper canvas").get(0), context = canvas.getContext("2d")

  //Initialization
    let drawing = false, color = "#000000", position = {
      current:{x:0, y:0},
      last:{x:0, y:0},
      cursor:{x:0, y:0, z:0},
      update(event) { return {x:event.clientX - canvas.getBoundingClientRect().left, y:event.clientY - canvas.getBoundingClientRect().top} }
    }, cursor = null, registered = false

  //Aframe components register
    AFRAME.registerComponent("cursor-listener", {init() { cursor = this.el }})
    AFRAME.registerComponent("place", {schema:{default:"", parse:AFRAME.utils.styleParser.parse},
      update() {
        if (registered) { return null } else { registered = true }
        function callback(e) {
          position.cursor = e.detail.intersection.point
          if (cursor) cursor.setAttribute("position", e.detail.intersection.point)
        }
        this.el.addEventListener("click", callback)
        this.el.addEventListener("touchstart", callback)
      }
    })

  //Canvas listeners
    $(canvas)
      .on("mousedown", e => drawing = !!(position.last = position.update(e)))
      .on("mousemove", e => position.current = position.update(e))
      .on("mouseup", e => drawing = false)
      .on("touchstart", e => position.update(touch(e, "mousedown")))
      .on("touchmove", e => touch(e, "mousemove"))
      .on("touchend", e => touch(e, "mouseup"))

  //Tools
    $("[data-color]").each((i, e) => $(e).css("background-color", $(e).attr("data-color")))
      .on("click", e => { $("[data-color]").removeClass("selected") ; color = $(e.target).addClass("selected").attr("data-color") })
    $("[data-action='clear']")
      .on("click", e => clear())
    $("[data-action='publish']")
      .on("click", e => publish())
    $(".a-enter-drawing")
      .on("click", e => $(".wrapper").toggle())

  //Rendering function
    function render() {
      if (!drawing) return null
      context.moveTo(position.last.x, position.last.y)
      context.lineTo(position.current.x, position.current.y)
      context.strokeStyle = color
      context.stroke()
      position.last = position.current
    }

  //Touch event handler
    function touch(e, trigger = "mousedown") {
      if (e.target === canvas) e.preventDefault()
      const touched = e.touches[0]
      canvas.dispatchEvent(new MouseEvent(trigger, touched && {clientX:touched.clientX, clientY:touched.clientY}))
      return touched
    }

  //Clear canvas
    function clear() {
      canvas.width = canvas.width
    }

  //Publish function
    function publish() {
      let p = position.cursor
      $("a-scene").append(`<a-image position="${p.x} ${p.y+0.5} ${p.z}" width="1" height="1" src="${canvas.toDataURL()}"></a-image>`)
      $(".wrapper").hide()
      clear()
    }

  //Drawing function
    (function draw() { render(), requestAnimationFrame(draw) })()
})
